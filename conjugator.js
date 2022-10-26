function scrape() {
    const tenseDisplayName = {
        AP: "Active Part.",
        PERF: "Perfect",
        IMPF: "Imperfect",
        IMP: "Imperative",
        INF: "Infinitive"
    }

    const tenseDisplayNames = {
        m: "♂️",
        f: "♀️",
        p: "Plural",
        s: "Sing.",

        1: "1st",
        2: "2nd",
        3: "3rd",
    }

    const passiveVoice = {
        "hif'il": "huf'al",
        "pi'el": "pu'al"
    }


    function transformGizra(g, isPassive) {
        if (g === "pa'al") {
            return "qal (pa'al)"
        }
        if (isPassive) return passiveVoice[g]
        return g;
    }

    function modifyPush(arr, v) {
        arr.push(v);
        return arr;
    }

    function transformTense(t) {
        const [passive, tense, conj] = [
            t.split("-").at(-3),
            t.split("-").at(-2),
            t.split("-").at(-1),
        ];

        const re = /((?<person>\d+))?(?<gender>m|f)?(?<number>s|p)/g;
        const {
            person = "", gender = "", number = ""
        } = re.exec(conj)?.groups ?? {}
        const normalized = [
            tenseDisplayNames[person],
            tenseDisplayNames[gender],
            tenseDisplayNames[number]
        ].filter(a => a).join(" ");
        return [`${tenseDisplayName?.[tense] ?? tense} ${normalized}`, !!passive]
    }

    const [gizra, root, ...special] = Array.from(document.querySelectorAll('.container p'));

    const dupBank = {}
    const dupBankMeaning = {}
    const res = Array.from(document.querySelectorAll(".conjugation-table .conj-td"))
        .map(x => {
            x.querySelector(".hidden")?.remove();
            const verb = Array.from(x.querySelectorAll("div .menukad")).map(x => x.parentElement.parentElement.innerHTML.replace("*", "")).join("<br>")

            const [tense, isPassive] = transformTense(x.querySelector("div").id);
            const meaning = x.querySelector("div .meaning").innerHTML;

            dupBank[verb] = dupBank[verb] ? modifyPush(dupBank[verb], tense) : [tense]
            dupBankMeaning[verb] = dupBankMeaning[verb] ? modifyPush(dupBankMeaning[verb], meaning) : [meaning]
            return [
                verb,
                root.textContent.replace("Root: ", ""),
                transformGizra(gizra.textContent.replace("Verb – ", "").toLowerCase(), isPassive),
                special.map(x => x.textContent).join("<br>").replace("This root does not have any special conjugation properties.", "").replace(";", "."),
                tense,
                meaning
            ];
        })

    return res
        .map((row) => {
            const verb = row[0];
            const tense = row[4];

            if (dupBank[verb].length > 1) {
                if (dupBank[verb].findIndex(v => v === tense) === 0) {
                    return [...row, "", dupBank[verb].slice(1).join("<br>"), dupBankMeaning[verb].slice(1).join("<br>")]
                } else {
                    return [...row, "true", "", ""]
                }
            } else {
                return [...row, "", "", ""]
            }
        })
}

module.exports = {scrape};