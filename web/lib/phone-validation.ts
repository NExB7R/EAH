/** Validate an Egyptian mobile number stored in local 01xxxxxxxxx form. */
export function isEgyptianMobileNumber(value: string): boolean {
  return /^01[0125][0-9]{8}$/.test(value.trim())
}
