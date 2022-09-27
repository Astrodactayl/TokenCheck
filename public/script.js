const p = document.querySelector("p")

//input animation
document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", e => {
        if (!input.value) input.style.borderColor = "red"
        else input.style.borderColor = "wheat"
    })

    input.addEventListener("focusin", () => {
        document.querySelectorAll("input").forEach(input => input.style.borderColor = "black")
        input.style.borderColor = "wheat"
    })

    input.addEventListener("focusout", () => {
        document.querySelectorAll("input").forEach(input => input.style.borderColor = "wheat")
    })
})

//on submit
document.querySelector("form").addEventListener("submit", e => {
    e.preventDefault()
    const data = new FormData(e.target)

    //validation
    if (!data.get("tokenAuth").includes(":") && !["uuid", "sessionId"].every(key => data.get(key))) {
        document.querySelector("input[name='tokenAuth']").style.borderColor = "red"
        document.querySelector("input[name='uuid']").style.borderColor = "red"
        document.querySelector("input[name='sessionId']").style.borderColor = "red"
        return
    }

    //if tokenAuth has something, use it
    if (data.get("tokenAuth").includes(":")) {
        const [username, uuid, sessionId] = data.get("tokenAuth").split(":")
        data.set("uuid", uuid)
        data.set("sessionId", sessionId)
    }

    //post
    p.textContent = "Checking..."
    p.style.color = "yellow"
    fetch("/check", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(data)),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.json()).then(json => {
        p.textContent = json.text
        p.style.color = json.color
        p.hidden = false
    })
})