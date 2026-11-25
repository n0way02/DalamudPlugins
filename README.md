# ⚡ n0way02's Dalamud Plugin Repository

[![Dalamud API 15](https://img.shields.io/badge/Dalamud-API%2015-blue.svg)](https://dalamud.dev/)
[![Website](https://img.shields.io/badge/Website-n0wayplugins.discloud.app-6410C9.svg)](https://n0wayplugins.discloud.app/)
[![Fate Tracker](https://img.shields.io/badge/Fate%20Tracker-Live-FFE600.svg)](https://n0wayplugins.discloud.app/tracker)
[![Ko-fi Support](https://img.shields.io/badge/Support%20me-Ko--fi-ff5e5b.svg)](https://ko-fi.com/n0way02)

Official unified **Dalamud Custom Plugin Repository** for all Final Fantasy XIV plugins developed by **n0way02**.

🌐 **Official Website & Plugin Hub:** [https://n0wayplugins.discloud.app/](https://n0wayplugins.discloud.app/)  
📡 **FateFrenzy Live Web Tracker:** [https://n0wayplugins.discloud.app/tracker](https://n0wayplugins.discloud.app/tracker)

Add this single URL once in Dalamud to access and automatically update all plugins below (plus any future releases).

---

## 📥 How to Install (Dalamud)

1. Open Dalamud Settings in-game by typing `/xlsettings` in chat.
2. Go to the **Experimental** tab.
3. Under **Custom Plugin Repositories**, paste the following URL:
   ```text
   https://raw.githubusercontent.com/n0way02/DalamudPlugins/main/pluginmaster.json
   ```
4. Click the **`+`** button to add it, then click **Save and Close**.
5. Open the Plugin Installer (`/xlplugins`), search for the plugin you want, and click **Install**.

---

## 🧩 Included Plugins

| Plugin | Internal Name | Description | Repository |
| :--- | :--- | :--- | :--- |
| **FateFrenzy** | `FateFrenzy` | Fully automated FATE farming plugin with pathfinding, instance/world hopping, voucher trading, retainer market listing, Discord alerts, and live web tracker. | [n0way02/FateFrenzy](https://github.com/n0way02/FateFrenzy) |
| **Digitas Automatizados** | `KeyboundTyper` | Smart auto-typer and Auto-Loop farmer for the Gold Saucer **Keybound Brawler** minigame (FFXIV x FFVII). | [n0way02/DigitasAutomatizados](https://github.com/n0way02/DigitasAutomatizados) |
| **SubFrenzy** | `SubFrenzy` | Automatic Submarine Gil & Salvaged Accessories tracker by day, month, year, and character — AutoRetainer Multi-Mode friendly with bar charts and EN/PT-BR UI. | [n0way02/SubFrenzy](https://github.com/n0way02/SubFrenzy) |
| **FriendList Frenzy** | `FriendListFrenzy` | Modern Friend List manager with custom groups, nicknames, notes, Last Seen tracking, protected favorites, and safe Bulk Friend Removal. | [n0way02/FriendListFrenzy](https://github.com/n0way02/FriendListFrenzy) |
| **PetFrenzy** | `PetFrenzy` | Animated Eorzea Tamagotchi companion (Carbuncle, Fat Cat, Moogle, Namazu) that hatches from an egg and reacts live to your FFXIV gameplay! | [n0way02/PetFrenzy](https://github.com/n0way02/PetFrenzy) |

---

## 🔄 Auto-Sync Architecture

This repository acts as a lightweight catalog hub:
- Each plugin maintains its own source code, releases (`latest.zip`), and `pluginmaster.json` in its own repository.
- [`sources.json`](sources.json) lists all plugin feeds included in this unified repo.
- A GitHub Action ([`sync-plugins.yml`](.github/workflows/sync-plugins.yml)) runs hourly (and on-demand via **Actions → Sync Plugin Repository → Run workflow**) to pull the latest versions and update [`pluginmaster.json`](pluginmaster.json) automatically.

### Adding a New Plugin

1. Add the new plugin's `pluginmaster.json` raw URL to [`sources.json`](sources.json).
2. Push to `main` (or run `node scripts/sync-plugins.mjs` locally).
3. The workflow automatically updates [`pluginmaster.json`](pluginmaster.json) and publishes the new plugin to everyone using this repo URL.

---

## ☕ Support

If these plugins save you time and enhance your experience in Eorzea, consider supporting development:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20on%20Ko--fi-ff5e5b?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/n0way02)
