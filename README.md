<a id="top"></a>

# cuGuessr

## Table of Contents

1. [About](#about)
   1. [Screenshots](#screenshots)
   2. [Technologies Used](#technologies-used)
2. [Getting Started](#getting-started)
   1. [Prerequisites](#prerequisites)
   2. [Installation](#installation)
3. [Roadmap](#roadmap)
4. [Contributing](#contributing)
5. [License](#license)
6. [Acknowledgements](#acknowledgements)

## About

**This app is not affiliated with Carleton University in any way.**

cuGuessr is a GeoGuessr-style game set entirely on Carleton's campus. Play the [daily challenge](https://cuguessr.com) and share your score with friends, or just see how well you actually know your school.

All photos are submitted by the community. Think you've got a good spot? [Submit it here](https://cuguessr.com/submit).

### Screenshots

<div align="center">
  <img alt="Image Screenshot" src="/public/image.png" width="30%" />
  <img alt="Map Screenshot" src="/public/map.png" width="30%" />
  <img alt="Submit Screenshot" src="/public/submit.png" width="30%" />
</div>

### Technologies Used

- bun
- MapTiler
- Next.js
- Supabase

<div align="end">
  <a href="#top">Back to Top</a>
</div>

## Getting Started

### Prerequisites

- bun

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/natebabyak/cuguessr.git
```

```bash
cd cuguessr
```

#### 2. Install the dependencies

```bash
bun install
```

#### 3. Configure the environment variables

```bash
touch .env.local
```

```bash
# MapTiler
NEXT_PUBLIC_MAPTILER_API_KEY=your_maptiler_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

#### 4. Run the development server

```bash
bun dev
```

<div align="end">
  <a href="#top">Back to Top</a>
</div>

## Roadmap

See [issues](https://github.com/natebabyak/cuguessr/issues).

<div align="end">
  <a href="#top">Back to Top</a>
</div>

## Contributing

This project isn't open source yet, but I'd love to hear from you. Whether it's a bug, a feature idea, or just a suggestion, feel free to open an issue or drop me an email at [nate.babyak@outlook.com](mailto:nate.babyak@outlook.com).

Another great way to help is by submitting photos of the Carleton campus [here](https://cuguessr.com/submit). More images means a better experience for everyone!

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
