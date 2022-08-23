// NOTE: Timezone affects date presentation, so in US it will be 1 day behind,
//       that is why `new Date()` is not needed.
//       Birthday date in FHIR => "birthDate": "1960-01-20"
export const formatDateOfBirth = (birthDate: string): string => {
    const [year, month, day] = birthDate.split('-')
  
    const dateOfBirth = `${month}/${day}/${year}`
  
    return dateOfBirth
}

export const sortRecordByDateField = ( dateFieldName: string, records: any[] ) => {
    records.sort((a, b) => Date.parse(a[dateFieldName]) - Date.parse(b[dateFieldName]))
    // set correct dose number if dose objects are swapped
    for (const [index, rec] of records.entries()) {
      rec.index = index + 1
    }
  }

