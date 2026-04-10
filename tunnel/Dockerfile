FROM alpine:3.19
RUN apk add --no-cache curl
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then CF_ARCH="amd64"; \
    elif [ "$ARCH" = "aarch64" ]; then CF_ARCH="arm64"; \
    else CF_ARCH="amd64"; fi && \
    curl -fsSL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${CF_ARCH}" \
    -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared
VOLUME /tunnel
CMD ["sh", "-c", "rm -f /tunnel/tunnel.log && cloudflared tunnel --no-autoupdate --protocol http2 --url http://frontend:80 2>&1 | tee /tunnel/tunnel.log"]
