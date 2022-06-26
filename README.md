# ocr-web-api

## Introduction

A NodeJS web API wrapper for Tesseract OCR, built with no libraries, frameworks, or any other runtime dependencies. 

### Demo

https://ocr.ncn.dev

### Goals
Original intention for this project was to explore a few different areas:
- To use optical character recognition (OCR) to parse images for text
- To build a POC for a NodeJS server framework with no libraries, frameworks, or runtime dependencies
- To configure build tools from scratch without using boilerplates or project starters
- To implement OOP design patterns and principles in the context of Node and Typescript
- To implement file based routing, inspired by NextJS  

All of the original goals were completed, and while deploying this project I was inspired to build another tool that [automates the setup process of a VPS](https://github.com/ncn-ends/vps-scaffold).

To learn more about what I learned and the difficulties that were overcome during this project, [you can read the blog post I wrote here](https://gist.github.com/ncn-ends/aa6db18707fd3b1d506bac14d41be2d9).

## Usage

- You can create new endpoints by creating a file in `/src/routes`.
    - Folders are respected
        - e.g. `/src/routes/api/hello/world.ts` will point to `<domain>/api/hello/world`

- The server requires Tesseract OCR CLI to be installed on a linux system
    - If using Windows, need to may need to make slight modifications to the cli executable command.

### Development
```js
yarn createApiKey -l "dev"
```
- Create an api key to be used during development

```
yarn dev
```
- Start the dev server

```
yarn debug
```
- Debug the application
    - May need to be configured depending on what IDE you use

### Testing

```
yarn test:e2e
yarn test:unit
yarn test:all
```
- Isolate tests or execute all tests
- 12321 is the apikey used during testing and only works when `NODE_ENV` is set to testing

### Production
```
yarn createApiKey -l "for ncn-ends"
yarn build
yarn start
```
- Create a separate api key for each user you will be sharing with
- You can build the application and then use zip deployment to run the program without any dependencies
- You can also just start the application once it has been built

## Authors

- [@ncn-ends](https://www.github.com/ncn-ends)


## License

[MIT](https://choosealicense.com/licenses/mit/)
