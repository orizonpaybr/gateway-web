export interface TermosSection {
  id: string
  title: string
  content: string
}

export interface TermosData {
  lastUpdated: string
  sections: TermosSection[]
}

export interface ContactInfo {
  email: string
  phone: string
  workingHours: string
}
