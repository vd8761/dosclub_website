import { listPartnerLogos } from "@/lib/partners";
import PartnersShowcase from "./PartnersShowcase";

// Server component: reads the logo folders at build time and hands the lists
// to the client showcase. Add images to:
// public/partners/institution_partners/
// public/partners/industrial_partners/
export default function Partners() {
  const institutions = listPartnerLogos("academic_partners");
  const industry = listPartnerLogos("industry_partners");
  return <PartnersShowcase institutions={institutions} industry={industry} />;
}
