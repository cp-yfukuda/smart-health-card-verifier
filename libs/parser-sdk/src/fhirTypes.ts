type BundleEntryAnyType = {[key: string]: any | undefined };


export interface BundleEntryType extends BundleEntryAnyType {
  id?: string
  extension?: unknown[]
  modifierExtension?: unknown[]
} 

export interface FHIRBundleType {
  text?: string
  Coding?: { display: unknown }
  CodeableConcept?: { text: unknown }
  meta?: unknown
  id?: unknown
  resourceType: string
  type: string
  entry: BundleEntryType[]
}