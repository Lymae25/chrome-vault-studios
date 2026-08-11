# Chrome Vault Studios

Hjemmeside med booking-formular. Node + Express, klar til Railway.

```
chrome-vault-studios/
├── server.js              Backend: serverer siden + sender forespørgsler på mail
├── package.json
├── .env.example           Skabelon til dine mail-oplysninger
├── .gitignore
└── public/
    ├── index.html         Alle fire sektioner
    ├── styles.css
    ├── script.js          Galleri, menu, lightbox, formular
    └── assets/
        ├── logo.jpg
        └── work/          ← dine videoer og billeder kommer her
```

---

## 1. Kør den lokalt

```bash
npm install
npm run dev
```

Åbn http://localhost:3000

Uden mail-opsætning bliver forespørgsler skrevet i terminalen i stedet for
at blive sendt. Formularen virker altså med det samme.

---

## 2. Læg dit arbejde i galleriet

Læg filer i `public/assets/work/`, og tilføj dem øverst i `public/script.js`:

```js
const WORK = [
  { type: "video", kind: "video", title: "Yumé — Music i Lejet",
    src: "/assets/work/yume-lejet.mp4", poster: "/assets/work/yume-lejet.jpg" },

  { type: "photo", kind: "photo", title: "K-ink — Studio",
    src: "/assets/work/kink-01.jpg" },

  { type: "video", kind: "event", title: "Chateau Motel — Lørdag",
    src: "/assets/work/chateau.mp4", poster: "/assets/work/chateau.jpg" },
];
```

- `kind` styrer filterknapperne: `video`, `photo` eller `event`
- `poster` er billedet der vises før en video afspilles
- Videoer afspiller automatisk når man holder musen over dem

Hold videoerne under ca. 10 MB. Store filer gør siden langsom.
Er listen tom, viser galleriet "Kommer snart" i stedet.

---

## 3. Sæt mailen op

Formularen sender til `chromevaultstudios@outlook.dk`.

Microsoft kræver et **app-password**, ikke dit almindelige kodeord:

1. Gå til https://account.microsoft.com/security
2. Slå to-faktor til, hvis det ikke allerede er slået til
3. Opret et app-password
4. Brug det som `SMTP_PASS`

Lokalt: kopiér `.env.example` til `.env` og udfyld den.

> Virker Outlook-SMTP ikke (Microsoft lukker gradvist ned for det),
> så opret en gratis konto på **resend.com** eller **brevo.com** og brug
> deres SMTP-oplysninger i stedet. Kun de fire variabler nedenfor skal ændres.

---

## 4. Deploy på Railway

1. Læg projektet på GitHub
2. Railway → **New Project** → **Deploy from GitHub repo**
3. Under **Variables** tilføjer du:

   | Navn | Værdi |
   |------|-------|
   | `SMTP_HOST` | `smtp-mail.outlook.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | `chromevaultstudios@outlook.dk` |
   | `SMTP_PASS` | dit app-password |
   | `MAIL_TO` | `chromevaultstudios@outlook.dk` |

4. Railway kører selv `npm install` og `npm start`
5. Under **Settings → Networking → Generate Domain** får du en adresse

`PORT` sætter Railway automatisk. Den skal du ikke røre.

**Eget domæne:** Settings → Networking → Custom Domain. Railway giver dig
en CNAME-værdi, som du sætter ind hos den udbyder du har købt domænet af.

---

## 5. Sådan virker formularen

Beskeden lander i din indbakke med afsenderens mail som svaradresse,
så du bare kan trykke Besvar.

Indbygget beskyttelse:
- Skjult felt som bots udfylder og mennesker aldrig ser
- Maks 5 forespørgsler pr. IP hver 15. minut
- Alle felter valideres både i browseren og på serveren

---

## Ret i teksten

| Hvad | Hvor |
|------|------|
| Priser og pakker | `public/index.html`, søg efter `option-price` |
| Om os | `public/index.html`, sektionen `id="om"` |
| Kundeliste | `public/index.html`, søg efter `hero-clients` |
| Farver og skrifttyper | `public/styles.css`, øverst under `:root` |
| Galleri | `public/script.js`, `WORK`-listen øverst |
