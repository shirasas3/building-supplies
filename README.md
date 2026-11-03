# תקציב ציוד לבניין

אפליקציית React (Vite) בעברית, מותאמת לטלפון.

## הרצה
```
npm install
npm run dev
```
פותחים את הכתובת שמופיעה בטרמינל (גם מהטלפון, באותה רשת wifi).

## בנייה לפרסום
```
npm run build
```
התיקייה dist מכילה את האתר המוכן להעלאה (Netlify, Vercel, GitHub Pages ועוד).

## פרסום ב־GitHub Pages
1. ליצור repository חדש ב־GitHub ולהעלות אליו את כל הקבצים (כולל התיקייה `.github`).
2. ב־GitHub: Settings ← Pages ← Source: בוחרים **GitHub Actions**.
3. בכל push ל־main האתר נבנה ומתפרסם לבד.
4. הכתובת: `https://USERNAME.github.io/REPO-NAME/`
