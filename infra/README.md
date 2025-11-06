# Infrastructure

This directory contains infrastructure configuration files for the Rocket Gifts project.

## Docker Compose

The `docker-compose.yml` file sets up:
- **PostgreSQL**: Database for the application
- **Redis**: Caching and session storage (optional)

### Usage

Start services:
```bash
docker-compose up -d
```

Stop services:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs -f
```

## Nginx Configuration

The `nginx.conf.example` file provides a production-ready nginx configuration for:
- SSL/TLS termination
- Reverse proxy for frontend and backend
- Telegram webhook handling

### Setup

1. Copy the example file:
   ```bash
   sudo cp nginx.conf.example /etc/nginx/sites-available/rocket-gifts
   ```

2. Update the configuration with your domain name

3. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/rocket-gifts /etc/nginx/sites-enabled/
   ```

4. Test configuration:
   ```bash
   sudo nginx -t
   ```

5. Reload nginx:
   ```bash
   sudo systemctl reload nginx
   ```

### SSL Certificates

Use Let's Encrypt with certbot:
```bash
sudo certbot --nginx -d your-domain.com
```

## Production Deployment

For production deployment, consider:
- Using environment-specific docker-compose files
- Setting up proper backup strategies
- Configuring monitoring and logging
- Setting up CI/CD pipelines

