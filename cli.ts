import { createInterface, Interface } from "readline/promises"

interface pkgJson {
    name: string
    version: string
    description: string
    keywords: string[]
    repository: string
    homepage: string
    bugs: string
    types: string
    files: string[]
    devDependencies: Record<string, string>
    scripts: Record<string, string>
}

const main = async () => {
    const ask = askln(createInterface(process.stdin, process.stdout))
    const askStr = ask([])
    const dirSelf = import.meta.dir
    const pkgJsonSelf = await Bun.file(`${dirSelf}/package.json`).json() as pkgJson
    console.log(`
${pkgJsonSelf.name} - ${pkgJsonSelf.version}
${pkgJsonSelf.description}
    `.trim())
    const nameSel = await askStr("Please enter a project name: ")
    const prettyNameSel = nameSel
        .replaceAll("-", " ")
        .split(" ")
        .map(part => part === "" ? part : `${part.at(0)!.toUpperCase()}${part.slice(1)}`)
        .join(" ")
    const pkgJsonBase: pkgJson = {
        ...pkgJsonSelf,
        name: nameSel,
        version: "0.1.0",
        description: prettyNameSel,
        keywords: [],
        repository: pkgJsonSelf.repository.replaceAll("create-bun-project-lialh4", nameSel),
        homepage: pkgJsonSelf.homepage.replaceAll("create-bun-project-lialh4", nameSel),
        bugs: pkgJsonSelf.bugs.replaceAll("create-bun-project-lialh4", nameSel)
    }
    const templSel = await ask(["1", "2"])(`
Please select a templete.
1. Application
2. Library
Select [1/2]: `.trimStart())
    if (templSel === "1") {
        const pkgJsonApp: pkgJson = {
            ...pkgJsonBase,
            scripts: {
                "start": "bun run src/index.ts"
            }
        }
        await Bun.$`mkdir ${nameSel}`
        await Bun.$`cp -r ${dirSelf}/src ${nameSel}`
        await Bun.$`cp ${dirSelf}/.gitignore ${nameSel}`
        await Bun.$`cp ${dirSelf}/bunfig.toml ${nameSel}`
        await Bun.$`cp ${dirSelf}/LICENSE ${nameSel}`
        await Bun.$`cp ${dirSelf}/tsconfig.json ${nameSel}`
        await Bun.write(`${nameSel}/package.json`, JSON.stringify(pkgJsonApp, null, 4))
        await Bun.write(`${nameSel}/README.md`, `
# ${prettyNameSel}

${prettyNameSel}
            `.trim())
    } else {
        const pkgJsonLib: pkgJson = {
            ...pkgJsonBase,
            types: "dist/index.d.ts",
            files: [...pkgJsonBase.files, "dist/**/*"],
            devDependencies: {
                ...pkgJsonBase.devDependencies,
                "tsc-alias": "^1"
            },
            scripts: {
                prepublishOnly: "bun run compile",
                compile: "bun run tsc && bun run tsc-alias"
            }
        }
        await Bun.$`mkdir ${nameSel}`
        await Bun.$`mkdir ${nameSel}/dist`
        await Bun.$`cp -r ${dirSelf}/src ${nameSel}`
        await Bun.$`cp -r ${dirSelf}/tests ${nameSel}`
        await Bun.$`cp ${dirSelf}/.gitignore ${nameSel}`
        await Bun.$`cp ${dirSelf}/bunfig.toml ${nameSel}`
        await Bun.$`cp ${dirSelf}/LICENSE ${nameSel}`
        await Bun.$`cp ${dirSelf}/tsconfig.json ${nameSel}`
        await Bun.write(`${nameSel}/package.json`, JSON.stringify(pkgJsonApp, null, 4))
        await Bun.write(`${nameSel}/README.md`, `
# ${prettyNameSel}

${prettyNameSel}
            `.trim())
    }
    process.exit()
}

const askln = (readln: Interface) => (sels: string[]) =>
    async (prompt: string): Promise<string> => {
        const rawAnswer = await readln.question(prompt)
        const answer = rawAnswer.trim()
        if (sels.length <= 0) return answer
        else if (!sels.includes(answer)) {
            console.log(`
Invalid selection! Please try again.
Available selections are: ${sels.map(sel => `"${sel}"`).join(", ")}
                `.trim())
            return await askln(readln)(sels)(prompt)
        }
        else return answer
    }

if (import.meta.main) {
    if (Bun.argv.length >= 3)
        console.log(`
Non-interactive usage is coming soon.
Please remove args at now.
            `.trim())
    else
        main()
}