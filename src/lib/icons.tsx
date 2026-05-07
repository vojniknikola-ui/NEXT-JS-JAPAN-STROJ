import React from 'react';

const createIcon = (path: React.ReactNode, viewBox = "0 0 24 24") => {
  const IconComponent = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox={viewBox} {...props}>
      {path}
    </svg>
  );
  IconComponent.displayName = 'IconComponent';
  return IconComponent;
};

const createStrokeIcon = (path: React.ReactNode) => {
  const StrokeIconComponent = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      {path}
    </svg>
  );
  StrokeIconComponent.displayName = 'StrokeIconComponent';
  return StrokeIconComponent;
};

export const ShareIcon = createStrokeIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />);
ShareIcon.displayName = 'ShareIcon';

export const FacebookIcon = createIcon(<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>);
FacebookIcon.displayName = 'FacebookIcon';

export const CopyIcon = createStrokeIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />);
CopyIcon.displayName = 'CopyIcon';

export const CheckIcon = createStrokeIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />);
CheckIcon.displayName = 'CheckIcon';

export const CartIcon = createStrokeIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5" />);
CartIcon.displayName = 'CartIcon';

export const SearchIcon = createStrokeIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />);
SearchIcon.displayName = 'SearchIcon';

export const WhatsAppIcon = createIcon(<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>);
WhatsAppIcon.displayName = 'WhatsAppIcon';

export const ViberIcon = createIcon(
  <>
    <path d="M12.02 2.25c-5.1 0-9.25 3.68-9.25 8.22 0 2.17.95 4.14 2.51 5.61l-.76 3.07a.62.62 0 00.9.69l3.39-1.74c.99.37 2.07.58 3.21.58 5.11 0 9.26-3.68 9.26-8.21 0-4.54-4.15-8.22-9.26-8.22zm0 1.9c4.05 0 7.35 2.84 7.35 6.32 0 3.49-3.3 6.32-7.35 6.32-1.08 0-2.09-.2-3.01-.59l-.39-.17-1.73.89.38-1.55-.46-.4c-1.33-1.15-2.12-2.75-2.12-4.5 0-3.48 3.29-6.32 7.33-6.32z" />
    <path d="M9.19 7.25c.25-.08.51-.02.69.17l.77.83c.18.19.22.47.1.71l-.46.92c.32.68.82 1.31 1.45 1.84.64.53 1.36.91 2.09 1.12l.77-.6a.67.67 0 01.74-.05l.97.59c.23.14.35.4.31.66-.09.57-.42 1.05-.91 1.33-.65.37-1.51.31-2.5-.08a9.63 9.63 0 01-2.91-1.85 9.52 9.52 0 01-2.23-2.64c-.53-.92-.73-1.77-.45-2.47.2-.52.62-.91 1.19-1.09l.41-.13z" />
    <path d="M13.29 6.84c1.56.23 2.73 1.43 2.91 2.99a.58.58 0 01-1.15.14 2.31 2.31 0 00-1.93-1.98.58.58 0 11.17-1.15zm-.02 1.78c.73.16 1.24.69 1.37 1.43a.55.55 0 01-1.08.19.75.75 0 00-.52-.54.55.55 0 01.23-1.08zm.18-3.55c2.4.28 4.26 2.11 4.57 4.5a.59.59 0 01-1.16.15 4.05 4.05 0 00-3.55-3.49.58.58 0 11.14-1.16z" />
  </>
);
ViberIcon.displayName = 'ViberIcon';

export const AdminIcon = createStrokeIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />);
AdminIcon.displayName = 'AdminIcon';
export const HomeIcon = createIcon(<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>);
HomeIcon.displayName = 'HomeIcon';
export const CatalogIcon = createIcon(<path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>);
CatalogIcon.displayName = 'CatalogIcon';
export const ManualIcon = createIcon(<path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>);
ManualIcon.displayName = 'ManualIcon';
export const CogIcon = createIcon(<><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></>);
CogIcon.displayName = 'CogIcon';
export const ContactIcon = createStrokeIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M21.75 8.25v7.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25v-7.5m19.5 0A2.25 2.25 0 0019.5 6H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615A2.25 2.25 0 012.25 8.493V8.25" />);
ContactIcon.displayName = 'ContactIcon';
export const OlxIcon = createIcon(<><circle cx="12" cy="12" r="10"/><path fill="#000" d="M7 9.5C7 8.119 8.119 7 9.5 7S12 8.119 12 9.5 10.881 12 9.5 12 7 10.881 7 9.5zm5 0C12 8.119 13.119 7 14.5 7S17 8.119 17 9.5 15.881 12 14.5 12 12 10.881 12 9.5zM7.5 15l1.5 2h6.5l1.5-2z"/></>);
OlxIcon.displayName = 'OlxIcon';

export const FilterIcon = createStrokeIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />);
FilterIcon.displayName = 'FilterIcon';

export const MinusIcon = createStrokeIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />);
MinusIcon.displayName = 'MinusIcon';

export const PlusIcon = createStrokeIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />);
PlusIcon.displayName = 'PlusIcon';

export const TrashIcon = createStrokeIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />);
TrashIcon.displayName = 'TrashIcon';

export const ShoppingBagIcon = createStrokeIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />);
ShoppingBagIcon.displayName = 'ShoppingBagIcon';

export const ArrowLeftIcon = createStrokeIcon(<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />);
ArrowLeftIcon.displayName = 'ArrowLeftIcon';

export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
