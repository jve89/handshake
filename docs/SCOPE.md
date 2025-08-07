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

---

## Future Considerations

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


