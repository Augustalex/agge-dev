# Setup server
1. Run setup command from /setup folder for your OS
1. Run "bash ./plan_terraform" inside /infrastructure. If existing infrastructure exists then run "bash ./destroy_terraform" first.
1. Run "bash ./apply_terraform"
1. Log in to Digitalocean and get the IP address. SSH from your computer into the droplet.
1. Install Node using NVM from the /configure/install_nvm script. After installing NVM remember to run "source /root/.bashrc" before running "nvm install node".
1. Install pm2 using the script in /configure/install_pm2
1. Checkout the repository using the script in /configure/checkout_aggedev
1. Install nginx and setup the site. You can follow the middle part of this tutorial: https://www.youtube.com/watch?v=oykl1Ih9pMg&ab_channel=TraversyMedia
1. Setup certbot with auto renawal and nginx config. Follow this guide: https://certbot.eff.org/lets-encrypt/ubuntubionic-nginx
1. Run the server using pm2 and you are good to go!