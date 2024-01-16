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

export async function fetchWithTimeout (url: string, options: any={}, timeout: number, timeoutError: string): Promise<any> {
  
  const controller = new AbortController()
  const timerPromise = new Promise((_, reject) => {
    setTimeout(() => {
      controller.abort()
      reject( timeoutError )
    }, timeout)
  })
  return await Promise.race( [fetch( url, {
    ...options,
    signal: controller.signal  
  }), timerPromise ] )
}

