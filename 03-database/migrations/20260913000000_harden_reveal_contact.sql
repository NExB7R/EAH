cd ~/EAH
git add 03-database/migrations/20260913000000_harden_reveal_contact.sql
git commit -m "security: harden reveal_contact with validation + advisory lock + constraints"
git push origin ui-onlook
