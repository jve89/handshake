# SCOPE.md

## Overview

This document defines what is considered in-scope and out-of-scope for the Handshake project, particularly for the MVP and immediate next phases.

---

## In-Scope for MVP (v0.1)

- Basic user authentication (email login or hardcoded user)  
- Admin dashboard for creating and managing handshakes  
- Public-facing handshake page accessible via unique URLs  
- Dynamic handshake form composition with unlimited fields and types configurable by sender  
- Support for file uploads, text inputs, and dropdown/select fields  
- Storage of submissions and responses in PostgreSQL  
- Simple, clean UI focused on ease of use, clarity, and mobile responsiveness  
- No-login, no-app-required receiver experience  
- Local file storage for uploads in dev environment  
- React Router and Vite proxy configuration for smooth frontend/backend integration

---

## Out-of-Scope for MVP (v0.1)

- Payment integration (Stripe or other gateways)  
- E-signature collection and verification  
- Multi-language support  
- Team and role-based access control  
- Custom branding and theming  
- Mobile app development (native or PWA)  
- Analytics and detailed reporting  
- Public template marketplace  
- API access or webhooks  
- Autosave or draft submission support  
- File type restrictions or virus scanning  
- Inbox visibility for recipients with accounts  
- Login button on public handshakes  

---

## Future Considerations

- Inbox support for recipients with accounts  
  - Handshakes submitted while logged in will appear in the recipient’s dashboard  
  - New `/dashboard/inbox` route to display incoming handshakes  
  - Optional login prompt shown on public pages for recipients who want to track responses  
- Persistent file storage via S3 or equivalent for production  
- Advanced form validation and AI-assisted input  
- Payment and subscription management  
- Template sharing and duplication  
- Enhanced security and compliance features  
- Progressive Web App (PWA) and native mobile app development  

---

## Notes

- This document complements `/docs/NOTNOW.md` which lists features explicitly deferred.  
- Scope boundaries are subject to periodic review as the project evolves.



