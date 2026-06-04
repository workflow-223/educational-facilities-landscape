## Deploy

Ensure feature/0-deployment branch is up-to-date with main:

1. git checkout feature/0-deployment
2. git pull origin feature/0-deployment
3. git merge main
4. git push origin feature/0-deployment

To deploy:

1. Make sure your school VPN is running
2. ssh socs@jade.socs.uoguelph.ca
3. Enter password (check Discord #sprint-1 pinned messages)
4. cd JadeEd
5. git checkout feature/0-deployment
6. git pull origin feature/0-deployment
7. sudo docker compose -f compose.deploy.yml down -v
8. sudo docker compose -f compose.deploy.yml up --build -d
9. Go to https://cis3760.socs.uoguelph.ca/jade to verify