type Main = (args: string[]) => void

const main: Main = (args) => {
    console.log("Hello world!")
    console.log(`Args: ${args}`)
}

if (import.meta.main) main(Bun.argv.slice(2))