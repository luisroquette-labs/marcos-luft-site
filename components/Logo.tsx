import { BASE } from '@/app/base';

export default function Logo() {
  return (
    <img
      src={`${BASE}/logo-primary.svg`}
      alt="Marcos Luft"
      loading="eager"
    />
  );
}
