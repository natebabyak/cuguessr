<a id="top"></a>

# [cuGuessr](https://cuguessr.com)

How well do you know the Carleton campus?

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

You can play cuGuessr [here](https://cuguessr.com).

> cuGuessr is a web application inspired by GeoGuessr that challenges users to identify locations on the Carleton University campus based on images. Users can explore the campus virtually and test their knowledge of its landmarks and hidden gems.

### Screenshots

<div align="center">
  <img alt="Image Screenshot" src="/public/image.png" width="30%" />
  <img alt="Map Screenshot" src="/public/map.png" width="30%" />
  <img alt="Submit Screenshot" src="/public/submit.png" width="30%" />
</div>

### Technologies Used

- MapTiler
- Next.js
- bun
- Supabase

<div align="end">
  <a href="#top">Back to Top</a>
</div>

## Getting Started

### Prerequisites

- bun (recommended) or npm

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

- [ ] Implement daily challenges
- [ ] Implement daily leaderboard
- [ ] Implement image approval solution

<div align="end">
  <a href="#top">Back to Top</a>
</div>

## Contributing

This project is open source and contributions are welcome! If you have any ideas for new features or improvements, please feel free to submit a pull request.

Not interested in contributing code? You can also help by submitting new images of the Carleton campus or by reporting any bugs you encounter.

<div align="end">
  <a href="#top">Back to Top</a>
</div>

## License

[GNU General Public License v3.0](/LICENSE)

<div align="end">
  <a href="#top">Back to Top</a>
</div>

## Acknowledgements

- [GeoGuessr](https://www.geoguessr.com)
- [uwGuessr](https://uwguessr.com)

<div align="end">
  <a href="#top">Back to Top</a>
</div>
