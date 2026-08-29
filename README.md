<a id="top"></a>

# cuGuessr

## Table of Contents

1. [About](#about)
   1. [Screenshots](#screenshots)
   2. [Infrastructure](#infrastructure)
2. [Getting Started](#getting-started)
   1. [Prerequisites](#prerequisites)
   2. [Development](#development)
   3. [Production](#production)
3. [License](#license)
4. [Acknowledgements](#acknowledgements)

## About

> [!NOTE]
> This app is not affiliated with Carleton University in any way.

cuGuessr is a GeoGuessr-style game set entirely on Carleton's campus. Play the [daily challenge](https://cuguessr.com) and share your score with friends, or just see how well you actually know your school.

All photos are submitted by the community. Think you've got a good spot? [Submit it here](https://cuguessr.com/submit).

<div align="end">
  <a href="#top">Back to Top</a>
</div>

### Screenshots

<div align="center">
  <img alt="Image Screenshot" src="/public/image.png" width="30%" />
  <img alt="Map Screenshot" src="/public/map.png" width="30%" />
  <img alt="Submit Screenshot" src="/public/submit.png" width="30%" />
</div>

### Infrastructure

- [Cloudflare R2](https://www.cloudflare.com/products/r2/)
- [Cloudflare Workers](https://www.cloudflare.com/products/workers/)
- [MapLibre GL JS](https://maplibre.org/projects/gl-js/)
- [Neon](https://neon.com)
- [PMTiles](https://github.com/protomaps/PMTiles)
- [Tanstack Start](https://tanstack.com/start/latest)

<div align="end">
  <a href="#top">Back to Top</a>
</div>

## Getting Started

### For Users

Head on over to [cuguessr.com](https://cuguessr.com) to get started.

### For Developers

#### Prerequisites

- Docker
- pnpm

#### Development

##### 1. Clone repository

```bash
git clone https://github.com/natebabyak/cuguessr.git
cd cuguessr
```

##### 2. Install dependencies

```bash
pnpm install
```

##### 3. Configure environment variables

```bash
pnpm dlx auth@latest generate --output src/lib/db/auth-schema.ts --yes
```

### Tiles

#### 1. Pull the PMTiles CLI Docker image

```bash
docker pull protomaps/go-pmtiles
```

#### 2. Extract the PMTiles file

```bash
docker run --rm \
  -v "$(pwd):/data" \
  protomaps/go-pmtiles \
  extract \
  https://build.protomaps.com/20260827.pmtiles \
  /data/cu.pmtiles \
  --bbox=-75.747256,45.3366786,-75.647256,45.4366786
```

#### 3. Configure Cloudflare R2 CORS

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["range", "if-match"],
    "ExposeHeaders": ["etag"],
    "MaxAgeSeconds": 3000
  }
]
```

#### 6. Start the local database

```bash
docker compose up -d
```

#### 4. Run the development server

```bash
pnpm dev
```

<div align="end">
  <a href="#top">Back to Top</a>
</div>

## License

[GNU General Public License v3.0](/LICENSE)

<div align="end">
  <a href="#top">Back to Top</a>
</div>

## Acknowledgements

- GeoGuessr
- uwGuessr
- Wordle

<div align="end">
  <a href="#top">Back to Top</a>
</div>
