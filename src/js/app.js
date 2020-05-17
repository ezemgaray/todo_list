window.onload = function () {
    tasks.showAll()
    menu.showCustomMenu()
}

document.getElementById("menu").addEventListener("click", function (e) {
    switch (e.target.id || e.target.dataset.id) {
        case "filter-all":
            tasks.showAll()
            break
        case "filter-completed":
            tasks.showAll("completed")
            document.getElementById("todo-title").innerHTML = e.target.innerText
            break
        case "filter-important":
            tasks.showAll("important")
            document.getElementById("todo-title").innerHTML = e.target.innerText
            break
        case "add-custom":
            modal.showModal(e.target)
            break
        case "remove-custom":
            menu.update(e.target)
            break
        case "menu-custom":
            tasks.showAll(e.target.dataset.ref)
            document.getElementById("todo-title").innerHTML = e.target.innerText
            break
    }
})

document.getElementById("result").addEventListener("click", function (e) {

    if (!isNaN(parseFloat(e.target.id))) {
        modal.showModal(e.target)
    }
    switch (e.target.htmlFor) {
        case "check-delete":
            let checkDelete = document.getElementById("check-delete")
            if (!checkDelete.checked) {
                animations.deleteTask(e.target, checkDelete)
            }
            break
        case "completed":
            //change localstorage
            tasks.update(e.target)
            // remove element in visible list
            animations.completed(e.target)
            break
        case "important":
            //change localstorage
            tasks.update(e.target)
            //change style without updating visible list
            animations.important(e.target)
            break
    }
})

document.getElementById("add-task").addEventListener("click", function (e) {
    modal.showModal(e.target)
})

document.getElementById("search").addEventListener("focus", function (e) {
    animations.searchTask(e.target)
    search.init(e.target)
})


let animations = {
    /**
     * Delete task with confirm option
     * @param {*HTML ELEMENT} e 
     * @param {* HTML ELEMENT} checkDelete ->checkbox
     */
    deleteTask: function (e, checkDelete) {
        let task = e
        let element = document.getElementById(e.dataset.ref).firstChild

        element.classList.toggle("reduce")
        let divconfirm = document.createElement('div')
        divconfirm.className = "del__task"
        divconfirm.innerHTML = document.getElementById("deltask").innerHTML
        element.parentElement.style.pointerEvents = "none"
        setTimeout(function () {
            checkDelete.checked = false

            //add confirm to delete
            element.parentElement.appendChild(divconfirm)
            element.parentElement.querySelector('[data-del="delconfirm"]').onclick = function (e) {

                e.target.parentElement.parentElement.style.opacity = "0"
                element.classList.toggle("reduce")
                //If fonfirm delete, remove task
                tasks.update(task)
                e.target.parentElement.parentElement.parentElement.style.cssText = "height: 0; padding: 0; overflow: hidden; opacity: 0; transition: all .5s .5s ease-in-out"

                setTimeout(function () {
                    e.target.parentElement.parentElement.parentElement.remove()
                }, 1000)
            }
            element.parentElement.querySelector('[data-del="cancelconfirm"]').onclick = function (e) {
                //If cancel, revert to normal style
                e.target.parentElement.parentElement.previousElementSibling.classList.toggle("reduce")
                e.target.parentElement.parentElement.parentElement.style.pointerEvents = "all"
                e.target.parentElement.parentElement.remove()

            }
        }, 300)
    },
    completed: function (e) {
        document.getElementById(e.dataset.ref).remove()
    },
    important: function (e) {
        e.parentElement.classList.toggle("checked")
        document.getElementById(e.dataset.ref).firstChild.classList.toggle("important")
    },
    showmodal: function () {
        document.querySelector(".modal").style.display = "block"
    },
    searchTask: function (e) {
        e.parentElement.classList.add("active")
        document.getElementById("todo-title").innerHTML = "Search"
        e.onblur = function () {
            if (e.value === "") {
                document.getElementById("todo-title").innerHTML = "Tasks"
                e.parentElement.classList.remove("active")
            }
        }
    }
}
/**
 * Search actions
 * 
 */
let search = {
    /**
     * Search tasks
     * @param {*Input search} search 
     */
    init: function (search) {
        let printResult = this.printResult
        search.onkeyup = function () {
            if (search.value !== "") {
                let searchWord = search.value.toLowerCase();
                let searchResult = [];
                let tempStorage = storage.getLocalStorage("taskList")
                for (let task of tempStorage) {
                    if (task.title.toLowerCase().includes(searchWord)) {
                        searchResult.push(task);
                        if (searchResult.length > 0) printResult(searchResult);
                    }
                };
                if ((searchResult.length === 0)) {
                    document.getElementById('result').innerHTML = "";
                }
            } else {
                tasks.showAll();
                document.getElementById("todo-title").innerHTML = "Search"
            }
        }

    },
    /**
     * Print results
     * @param {*Array} taskResult 
     */
    printResult: function (taskResult) {
        let divList = document.getElementById("result")
        divList.innerHTML = ""
        for (let task of taskResult) {
            let divTask = document.createElement("div")
            divTask.id = task.id
            divTask.className = "task"

            template = `<div class="task__preview ${task.color} ${task.completed ? "completed" : ""} ${task.important ? "important" : ""}">
                            <div class="task__title">
                                <h3>${task.title} ${task.custom.length ? `<span class="incustom" data-ref="${task.custom}"></span>`:""}</h3>
                            </div>
                            <div class="task__actions">
                                <div class="task__completed ${task.completed ? "checked" : ""}" >
                                    <label for="completed" data-ref="${divTask.id}">
                                    </label>
                                </div>
                                <div class="task__important ${task.important ? "checked" : ""}">
                                    <label for="important" data-ref="${divTask.id}">
                                    </label>
                                </div>
                                <div class="task__delete">
                                    <label for="check-delete" data-ref="${divTask.id}"></label>
                                </div>
                            </div>
                        </div>`
            divTask.innerHTML = template
            divList.appendChild(divTask)
        }
    }

}
/**
 * Modal windows actions
 */
let modal = {
    showModal: function (element) {
        let modalBox = document.querySelector(".modalbox")
        switch (element.id) {
            case "add-task":
                this.modalAdd(modalBox)
                break
            case "add-custom":
                this.modalCustom(modalBox)
                break
            default:
                this.modalTask(element, modalBox)
                break
        }
    },
    modalAdd: function (modalBox) {
        modalBox.innerHTML = document.getElementById("templateformadd").innerHTML
        setTimeout(function () {
            modalBox.style.animationPlayState = "paused"
        }, 900)

        let tempStorage = storage.getLocalStorage("customList")
        if (tempStorage) {
            let select = document.formadd.fcustom
            let template = `<option value="">--</option>`
            for (let custom of tempStorage) {
                template += `<option value="${custom}">${custom}</option>`
            }
            select.innerHTML = template
        }

        document.querySelector(".modal").style.display = "block"
        validateForm.eventsForm()
    },
    modalCustom: function (modalBox) {
        modalBox.innerHTML = document.getElementById("templateformcustom").innerHTML
        setTimeout(function () {
            modalBox.style.animationPlayState = "paused"
        }, 900)
        document.querySelector(".modal").style.display = "block"
        validateForm.eventsForm()
    },
    modalTask: function (element, modalBox) {
        let tempStorage = storage.getLocalStorage("taskList")
        let task = tempStorage.find((item) => item.id == element.id)
        modalBox.innerHTML = `<span class="close" data-close="close"></span>
                                <div class="task__view">
                                <div class="view__title"><h3>${task.title}</h3></div>
                                <div class="view__desc"><p><b>Description:</b> ${task.description}</p></div>
                                <div class="view__more">
                                    <p><b>Custom List:</b> ${task.custom ? task.custom : "No"}</p>
                                    <p><b>Completed:</b> ${task.completed ? "Yes":"No"}</p>
                                    <p><b>Important:</b> ${task.important ? "Yes":"No"}</p>
                                    <p><b>Color:</b> ${task.color}</p>
                                </div>
                            </div>`
        setTimeout(function () {
            modalBox.style.animationPlayState = "paused"
        }, 900)
        document.querySelector(".modal").style.display = "block"
        let divmodal = document.getElementById("modal")
        divmodal.onclick = function (e) {
            if (e.target.id === "modal" || e.target.dataset.close) {
                modal.closeModal()
            }
        }
    },
    closeModal: function () {
        document.querySelector(".modalbox").style.animationPlayState = "running"
        setTimeout(function () {
            document.querySelector(".modalbox").innerHTML = ""
            document.querySelector(".modal").removeAttribute("style")
            document.querySelector(".modal").style.display = "none"
        }, 1000)
    }
}

let storage = {
    getLocalStorage: function (storageItem) {
        let tempLocalStorage = JSON.parse(localStorage.getItem(storageItem))
        return tempLocalStorage
    },
    saveLocalStorage: function (toSave, storageItem) {
        let storage = this.getLocalStorage(storageItem)

        if (storage) {
            storage.push(toSave)
        } else {
            let arr = []
            arr.push(toSave)
            localStorage.setItem(storageItem, JSON.stringify(arr))
            return
        }
        localStorage.setItem(storageItem, JSON.stringify(storage))
    }
}

let validateForm = {
    eventsForm: function () {
        let divmodal = document.getElementById("modal")
        if (document.formadd) {
            document.formadd.onsubmit = this.validateAdd
            document.formadd.ftitle.focus()
        } else {
            document.formcustom.onsubmit = this.validateCustom
            document.formcustom.fcustom.focus()
        }
        divmodal.onclick = function (e) {
            if (e.target.id === "modal" || e.target.dataset.close) {
                modal.closeModal()
            }
        }
    },
    validateCustom: function (e) {
        e.preventDefault()
        let form = document.formcustom
        let tempstorage = storage.getLocalStorage("customList")

        if (form.fcustom.value.trim().length < 3 || form.fcustom.value.length > 25) {
            form.querySelector('[for="fcustom"].error').style.display = "block"
            return
        }
        form.querySelector('[for="fcustom"].error').style.display = "none"

        // check if the list name already exists
        if (tempstorage && tempstorage.find(item => item.toLowerCase() == form.fcustom.value.toLowerCase())) {
            form.querySelector('[for="fcustom"].error').style.display = "block"
            return
        }
        form.querySelector('[for="fcustom"].error').style.display = "none"

        storage.saveLocalStorage(form.fcustom.value, "customList")
        menu.showCustomMenu()
        modal.closeModal()
    },
    validateAdd: function (e) {
        e.preventDefault()
        let form = document.formadd

        if (form.ftitle.value.trim().length < 3 || form.ftitle.value.length > 50) {
            form.querySelector('[for="ftitle"].error').style.display = "block"
            return
        }
        form.querySelector('[for="ftitle"].error').style.display = "none"

        if (form.fdescription.value.trim().length < 3 || form.fdescription.value.length > 500) {
            form.querySelector('[for="fdescription"].error').style.display = "block"
            return
        }
        form.querySelector('[for="fdescription"].error').style.display = "none"

        let task = {}
        task.id = e.timeStamp
        task.title = form.ftitle.value
        task.description = form.fdescription.value
        task.completed = form.fcompleted.checked ? true : false
        task.important = form.fimportant.checked ? true : false
        task.custom = form.fcustom.value
        task.color = form.fcolor.value

        storage.saveLocalStorage(task, "taskList")
        tasks.showAll()
        modal.closeModal()
    }
}

let menu = {
    showCustomMenu: function () {
        let tempCustom = storage.getLocalStorage("customList")
        divCustomResult = document.getElementById("custom-result")
        divCustomResult.innerHTML = ""
        if (tempCustom) {
            for (let custom of tempCustom) {
                let divcustom = document.createElement("div")
                divcustom.className = "menu__custom"
                divcustom.dataset.id = "menu-custom"
                divcustom.dataset.ref = custom
                let template = `${custom} <span data-ref="${custom}" data-id="remove-custom" class="remove__custom">`
                divcustom.innerHTML = template
                divCustomResult.appendChild(divcustom)
            }
        }
    },
    update: function (element) {

        let divconfirm = document.createElement('div')
        divconfirm.className = "del__custom"
        divconfirm.innerHTML = document.getElementById("delcustom").innerHTML
        element.parentElement.appendChild(divconfirm)
        element.style.display = "none"


        element.parentElement.querySelector('[data-del="delconfirm"]').onclick = function (e) {

            let tempstorage = storage.getLocalStorage("customList")
            tempstorage.splice(tempstorage.indexOf(element.dataset.ref), 1)
            if (tempstorage.length) {
                localStorage.setItem("customList", JSON.stringify(tempstorage))
            } else {
                localStorage.removeItem("customList")
            }
            tempstorage = storage.getLocalStorage("taskList")
            for (let task in tempstorage) {
                if (tempstorage[task].custom !== element.dataset.ref) continue
                tempstorage.splice(task, 1)
            }
            localStorage.setItem("taskList", JSON.stringify(tempstorage))
            menu.showCustomMenu()
            tasks.showAll()
        }

        element.parentElement.querySelector('[data-del="cancelconfirm"]').onclick = function (e) {
            e.target.parentElement.parentElement.parentElement.firstElementChild.removeAttribute("style")
            e.target.parentElement.parentElement.remove()
        }
    }
}

let tasks = {
    showAll: function (filter) {
        let tempstorage = storage.getLocalStorage("taskList")
        let divList = document.getElementById("result")
        document.getElementById("todo-title").innerHTML = "Tasks"
        divList.innerHTML = ""
        for (let task of tempstorage) {
            let divTask = document.createElement("div")
            divTask.id = task.id
            divTask.className = "task"

            template = `<div class="task__preview ${task.color} ${task.completed ? "completed" : ""} ${task.important ? "important" : ""}">
                            <div class="task__title">
                                <h3>${task.title} ${task.custom.length ? `<span class="incustom" data-ref="${task.custom}"></span>`:""}</h3>
                            </div>
                            <div class="task__actions">
                                <div class="task__completed ${task.completed ? "checked" : ""}" >
                                    <label for="completed" data-ref="${divTask.id}">
                                    </label>
                                </div>
                                <div class="task__important ${task.important ? "checked" : ""}">
                                    <label for="important" data-ref="${divTask.id}">
                                    </label>
                                </div>
                                <div class="task__delete">
                                    <label for="check-delete" data-ref="${divTask.id}"></label>
                                </div>
                            </div>
                        </div>`
            divTask.innerHTML = template

            if (!filter) {
                if (!task.completed && !task.custom) {
                    divList.appendChild(divTask)
                }
            } else {
                if (filter === "important") {
                    if (task.important && !task.completed && !task.custom) {
                        divList.appendChild(divTask)
                        continue
                    }
                }
                if (filter === "completed") {
                    if (task.completed) {
                        divList.appendChild(divTask)
                        continue
                    }
                }
                if (filter == task.custom && !task.completed) {
                    divList.appendChild(divTask)

                }
            }
        }
    },
    update: function (element) {
        let tempstorage = storage.getLocalStorage("taskList")

        for (let task in tempstorage) {
            if (tempstorage[task].id == element.dataset.ref) {
                if (element.htmlFor === "completed") {
                    tempstorage[task].completed = tempstorage[task].completed ? false : true
                    localStorage.setItem("taskList", JSON.stringify(tempstorage))
                    break
                }
                if (element.htmlFor === "important") {
                    tempstorage[task].important = tempstorage[task].important ? false : true
                    localStorage.setItem("taskList", JSON.stringify(tempstorage))
                    break
                }
                if (element.htmlFor === "check-delete") {
                    tempstorage.splice(task, 1)
                    localStorage.setItem("taskList", JSON.stringify(tempstorage))
                    if (tempstorage.length === 0) localStorage.removeItem("taskList")
                    break
                }
            }
        } //end for in
    }
}