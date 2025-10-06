import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from 'sonner';
import AuthWrapper from './components/AuthWrapper';
import { NextIntlClientProvider } from 'next-intl'; // ✅ CORRECTO
import { getMessages } from 'next-intl/server';     // ✅ CORRECTO


const inter = Inter({ subsets: ['latin'] });

[{
	"resource": "/c:/clon/app/[locale]/layout.tsx",
	"owner": "typescript",
	"code": "7031",
	"severity": 8,
	"message": "El elemento de enlace 'children' tiene un tipo 'any' implícito.",
	"source": "ts",
	"startLineNumber": 13,
	"startColumn": 44,
	"endLineNumber": 13,
	"endColumn": 52,
	"origin": "extHost1"
},{
	"resource": "/c:/clon/app/[locale]/layout.tsx",
	"owner": "typescript",
	"code": "7031",
	"severity": 8,
	"message": "El elemento de enlace 'params' tiene un tipo 'any' implícito.",
	"source": "ts",
	"startLineNumber": 13,
	"startColumn": 54,
	"endLineNumber": 13,
	"endColumn": 60,
	"origin": "extHost1"
}]
