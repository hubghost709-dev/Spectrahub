'use client'; // Declaramos que este es un Client Component

import { SignUp} from '@clerk/nextjs';
import { usePathname } from 'next/navigation';  // Usamos `usePathname` para obtener el locale

export default function SignInPage() {
  const pathname = usePathname();  // Obtenemos el pathname de la URL actual

  // Extraemos el locale desde la ruta
  const locale = pathname?.split('/')[1];  

  return (
    <SignUp
      path={`/${locale}/sign-up`} // Usamos el locale dinámico para dirigir la ruta
      routing="path" // Aseguramos que las rutas se manejen por path
      appearance={{
        variables: {
          colorPrimary: "#5e3b7f", // Puedes personalizar aquí si lo deseas
        },
      }}
    />
  );
}




