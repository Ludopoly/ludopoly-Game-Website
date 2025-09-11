// src/data/countries.ts
import { getData } from 'country-list'

export interface Country {
  code: string
  label: string
  flag: string
}

export const countries: Country[] = getData().map(({ code, name }) => ({
  code,
  label: name,
  flag: `https://flagcdn.com/w40/${code.toLowerCase()}.png`
}))
