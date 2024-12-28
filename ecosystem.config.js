module.exports = {
  deploy: {
    production: {
      user: "root",
      host: "167.172.166.147",
      ref: "origin/main",
      repo: "git@github.com-1QMA-front:lala68/1QMA-front.git",
      path: "/root/projects/sources/1qma.front",
      "pre-deploy": "git reset --hard",
      "post-deploy":
        "npm install; ng build --configuration production; cp -rf /root/projects/sources/1qma.front/source/dist/ma-games/browser /var/www/html/front.1qma.games/;",
    },
    staging: {
      user: "root",
      host: "64.226.74.250",
      ref: "origin/dev",
      repo: "git@github.com:lala68/1QMA-front.git",
      path: "/root/projects/sources/staging.1qma.front",
      "pre-deploy": "git reset --hard",
      "post-deploy":
        "npm install; ng build --configuration production; cp -rf /root/projects/sources/staging.1qma.front/source/dist/ma-games/browser /var/www/html/staging.front.1qma.games/;",
    },
  },
};
