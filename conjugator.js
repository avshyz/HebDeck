[gizra, root, ...special] = $('.container p')
tenseDisplayName = {
    AP: "Active Part.",
    PERF: "Perfect",
    IMPF: "Imperfect",
    IMP: "Imperative",
    INF: "Infinitive"
}

tenseDisplayNames = {
    m: "♂️",
    f: "♀️",
    p: "Plural",
    s: "Sing.",

    1: "1st",
    2: "2nd",
    3: "3rd",
}

passiveVoice = {
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

dupBank = {}
dupBankMeaning = {}
res = $$(".conjugation-table .conj-td").map(x => {
    const verb = x.querySelector("div .menukad").innerHTML.replace("*", "");

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
        x.querySelector("div .chaser")?.textContent.replace("~", "") ?? "",
        x.querySelector("div .transcription").innerHTML,
        meaning
    ];
})

console.log(res
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
    .map(row => row.join(";"))
    .sort((a, b) => b.length - a.length)
    .join("\n")
)