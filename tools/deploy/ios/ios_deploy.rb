require 'xcodeproj'
require 'pathname'
require "json"


unless defined?( PROJECT_ROOT  )
    PROJECT_ROOT = "#{Pathname.new(__FILE__).realpath.dirname.dirname.dirname.dirname}"
end


unless defined?( IOS_PROJECT_ROOT  )
    IOS_PROJECT_ROOT = "#{Pathname.new(__FILE__).realpath.dirname.dirname.dirname.dirname}/ios"
end


puts "ios_project_path = #{IOS_PROJECT_ROOT}"

module AppGeneration
    PATH = "#{IOS_PROJECT_ROOT}"
    XCODE_PROJ_PATH = "#{PATH}/Verifier.xcodeproj"
    PROJECT = Xcodeproj::Project.open XCODE_PROJ_PATH
end

module BuildConfig
    CONFIG = JSON.parse(File.open("#{PROJECT_ROOT}/buildconfig.json", 'rb').read)

    def version
        return CONFIG["versionName"]
    end

    def bundle_id( env )
        return "#{CONFIG["packageName"]}#{env=="dev" ? ".dev" : ""}"
    end
end


include BuildConfig

def update_bundle( bundle_name , version, market_version )
    AppGeneration::PROJECT.list_by_class( Xcodeproj::Project::XCBuildConfiguration ).each do |config|
      build_settings = config.build_settings
      if( build_settings["INFOPLIST_FILE"] == "Verifier/Info.plist")
          puts("BundleId: #{build_settings["PRODUCT_BUNDLE_IDENTIFIER"]} to #{bundle_name}}")
          puts("Version: #{build_settings["CURRENT_PROJECT_VERSION"]} to #{version}}")
          puts("MarketingVersion: #{build_settings["MARKETING_VERSION"]} to #{market_version}}")
          build_settings["PRODUCT_BUNDLE_IDENTIFIER"] = bundle_name
          build_settings["CURRENT_PROJECT_VERSION"] = version
          build_settings["MARKETING_VERSION"] = market_version
      end
    end
    AppGeneration::PROJECT.save()
end

env = "prod"
puts("version: #{BuildConfig::version()}")
puts("version: #{BuildConfig::bundle_id(env)}")
update_bundle( bundle_id( env ), version(), version() )
