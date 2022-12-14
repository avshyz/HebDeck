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

    const [gizra, root, ...specialDiv] = Array.from(document.querySelectorAll('.container p'));
    const generalSpecialNote = specialDiv
        .map(x => x.textContent)
        .join("<br>")
        .replace("This root does not have any special conjugation properties.", "")
        .replace(";", ".");

    const dupBank = {}
    const dupBankMeaning = {}
    const res = Array.from(document.querySelectorAll(".conjugation-table .conj-td"))
        .map(x => {
            const conjugatedSpecialNote = x.querySelector(".hidden")?.innerHTML.replace(";", "") ?? ""

            x.querySelector(".hidden")?.remove();
            const verb = Array.from(x.querySelectorAll("div .menukad"))
                .map(x =>
                    x
                        .parentElement
                        .parentElement.innerHTML
                        .replace(/[^0-9a-z\u0591-\u05BD\u05BF-\u05C2\u05C4-\u05C7א-ת/<> =\"\']/gi, '')
                )
                .join("<br>")

            const onlyHebrew = Array.from(x.querySelectorAll("div .menukad"))
                .map(x => x.textContent.replace(/[^0-9a-z\u0591-\u05BD\u05BF-\u05C2\u05C4-\u05C7א-ת/]/gi, ''))
                .join(", ")

            const [tense, isPassive] = transformTense(x.querySelector("div").id);
            const meaning = x.querySelector("div .meaning").innerHTML;

            dupBank[verb] = dupBank[verb] ? modifyPush(dupBank[verb], tense) : [tense]
            dupBankMeaning[verb] = dupBankMeaning[verb] ? modifyPush(dupBankMeaning[verb], meaning) : [meaning]
            return [
                verb,
                root.textContent.replace("Root: ", ""),
                transformGizra(gizra.textContent.replace("Verb – ", "").toLowerCase(), isPassive),
                `${conjugatedSpecialNote}${conjugatedSpecialNote.length > 0 && generalSpecialNote.length > 0 ? "<br>" : ""}${generalSpecialNote}`,
                tense.trim(),
                meaning,
                onlyHebrew
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