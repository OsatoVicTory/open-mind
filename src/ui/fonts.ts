import localFont from 'next/font/local';

export const Geist = localFont({
  src: [
    { path: '../../public/font/GeistThin.otf', weight: '400', style: 'normal' },
    { path: '../../public/font/GeistRegular.otf', weight: '500', style: 'normal' },
    { path: '../../public/font/GeistMedium.otf', weight: '550', style: 'normal' },
    { path: '../../public/font/GeistSemiBold.otf', weight: '650', style: 'normal' },
    { path: '../../public/font/GeistBold.otf', weight: '750', style: 'normal' },
  ],
  variable: '--font-Geist',
  display: 'swap',
});