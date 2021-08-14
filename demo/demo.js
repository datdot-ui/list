const head = require('head')()
const bel = require('bel')
const csjs = require('csjs-inject')

// datdot-ui dependences
const list = require('..')
const terminal = require('datdot-terminal')
const icon = require('datdot-ui-icon')
const message_maker = require('../src/node_modules/message-maker')

function demo () {
    const recipients = []
    const logs = terminal({mode: 'comfortable', expanded: false}, protocol('logs'))
    const options1 = [
        {
            text: 'Option1',
            icon: icon({name: 'check', path: 'assets'}),
        },
        {
            text: 'Option2',
            icon: icon({name: 'check', path: 'assets'}),
        },
        {
            text: 'Option3',
            icon: icon({name: 'check', path: 'assets'}),
            current: true,
            selected: true
        }
    ]
    const options2 = [
        {
            text: 'Option1',
            icon: icon({name: 'check', path: 'assets'}),
            selected: true
        },
        {
            text: 'Option2',
            icon: icon({name: 'check', path: 'assets'}),
        },
        {
            text: 'Option3',
            icon: icon({name: 'check', path: 'assets'}),
            selected: true
        }
    ]
    const options3 = [
        {
            text: 'DatDot',
            url: 'https://datdot.org/',
            icon: icon({name: 'check', path: 'assets'}),
            img: 'https://raw.githubusercontent.com/playproject-io/datdot/master/packages/datdot/logo-datdot.png'
        },
        {
            text: 'Twitter',
            url: 'https://twitter.com/',
            disabled: true,
        },
        {
            text: 'GitHub',
            url: 'https://github.com/'
        }
    ]
    const single_select_list = list(
    {
        name: 'single-select-list', 
        body: options1, 
        mode: 'single-select', 
        hidden: false
    }, protocol('single-select-list'))
    const multiple_select_list = list(
    {
        name: 'multiple-select-list', 
        body: options2, 
        hidden: false
    }, protocol('multiple-select-list'))
    const dropdown_list = list(
    {
        name: 'dropdown-list',
        body: options3,
        mode: 'dropdown',
        hidden: false
    }, protocol('dropdown-list'))
    const current_single_selected = options1.filter( option => option.selected).map( ({text, icon, current, selected}) => text).join('')
    const current_multiple_selected = options2.filter( option => option.selected)
    const selected_length = bel`<span class="${css.count}">${current_multiple_selected.length}</span>`
    let select_items = bel`<span>${selected_length} ${current_multiple_selected.length > 1 ? `items` : `item`}</span>`
    const total_selected = bel`<span class="${css.total}">Total selected:</span>`
    total_selected.append(select_items)
    const select = bel`<span class="${css.select}">${current_single_selected}</span>`
    const select_result = bel`<div class="${css.result}">Current selected ${select}</div>`
    let selects = current_multiple_selected.map( option => bel`<span class=${css.badge}>${option.text}</span>`)
    let selects_result = bel`<div class="${css['selects-result']}"></div>`
    selects.map( select => selects_result.append(select))
    const content = bel`
    <div class="${css.content}">
        <h1>List</h1>
        <section>
            <h2>Multple select</h2>
            <div>
                ${total_selected}
                ${selects_result}
            </div>
            ${multiple_select_list}
        </section>
        <section>
            <h2>Single select</h2>
            ${select_result}
            ${single_select_list}
        </section>
            <h2>Dropdown</h2>
            ${dropdown_list}
        </section>
    </div>`
    const container = bel`<div class="${css.container}">${content}</div>`
    const app = bel`<div class="${css.wrap}" data-state="debug">${container}${logs}</div>`

    return app

    function change_event (data) {
        const {mode, selected} = data
        if (mode === 'single-select') return select.textContent = selected
        if (mode === 'multiple-select') {
            const selected_length = bel`<span class="${css.count}">${selected.length}</span>`
            select_items = bel`<span>${selected_length} ${selected.length > 1 ? `items` : `item`}</span>`
            selects = data.selected.map( option => bel`<span class=${css.badge}>${option}</span>`)
            selects_result.innerHTML = ''
            selects.map( item => selects_result.append(item))
            total_selected.lastChild.remove()
            total_selected.append(select_items)
        }
    }

    function protocol (name) {
        return send => {
            recipients[name] = send
            return get
        }
    }

    function get (msg) {
        const {head, type, data} = msg
        recipients['logs'](msg)
        if (type.match(/selected|unselected/) ) return change_event(data)
    }
}

const css = csjs`
:root {
    --b: 0, 0%;
    --r: 100%, 50%;
    --color-white: var(--b), 100%;
    --color-black: var(--b), 0%;
    --color-dark: 223, 13%, 20%;
    --color-deep-black: 222, 18%, 11%;
    --color-red: 358, 99%, 53%;
    --color-amaranth-pink: 331, 86%, 78%;
    --color-persian-rose: 323, 100%, 56%;
    --color-orange: 35, 100%, 58%;
    --color-safety-orange: 27, 100%, 50%;
    --color-deep-saffron: 31, 100%, 56%;
    --color-ultra-red: 348, 96%, 71%;
    --color-flame: 15, 80%, 50%;
    --color-verdigris: 180, 54%, 43%;
    --color-blue: 214, var(--r);
    --color-heavy-blue: 233, var(--r);
    --color-maya-blue: 205, 96%, 72%;
    --color-slate-blue: 248, 56%, 59%;
    --color-blue-jeans: 204, 96%, 61%;
    --color-dodger-blue: 213, 90%, 59%;
    --color-viridian-green: 180, 100%, 63%;
    --color-green: 136, 81%, 34%;
    --color-light-green: 127, 86%, 77%;
    --color-lime-green: 127, 100%, 40%;
    --color-slimy-green: 108, 100%, 28%;
    --color-maximum-blue-green: 180, 54%, 51%;
    --color-green: 136, 81%, 34%;
    --color-light-green: 97, 86%, 77%;
    --color-lincoln-green: 97, 100%, 18%;
    --color-yellow: 44, 100%, 55%;
    --color-chrome-yellow: 39, var(--r);
    --color-bright-yellow-crayola: 35, 100%, 58%;
    --color-green-yellow-crayola: 51, 100%, 83%;
    --color-purple: 283, var(--r);
    --color-medium-purple: 269, 100%, 70%;
    --color-electric-violet: 276, 98%, 48%;
    --color-grey33: var(--b), 20%;
    --color-grey66: var(--b), 40%;
    --color-grey70: var(--b), 44%;
    --color-grey88: var(--b), 53%;
    --color-greyA2: var(--b), 64%;
    --color-greyC3: var(--b), 76%;
    --color-greyCB: var(--b), 80%;
    --color-greyD8: var(--b), 85%;
    --color-greyD9: var(--b), 85%;
    --color-greyE2: var(--b), 89%;
    --color-greyEB: var(--b), 92%;
    --color-greyED: var(--b), 93%;
    --color-greyEF: var(--b), 94%;
    --color-greyF2: var(--b), 95%;
    --transparent: transparent;
    --define-font: *---------------------------------------------*;
    --size12: 1.2rem;
    --size14: 1.4rem;
    --size16: 1.6rem;
    --size18: 1.8rem;
    --size20: 2rem;
    --size22: 2.2rem;
    --size24: 2.4rem;
    --size26: 2.6rem;
    --size28: 2.8rem;
    --size30: 3rem;
    --size32: 3.2rem;
    --size36: 3.6rem;
    --size40: 4rem;
    --define-primary: *---------------------------------------------*;
    --primary-color: var(--color-black);
    --primary-bgColor: var(--color-greyF2);
    --primary-font: Arial, sens-serif;
    --primary-font-size: var(--size16);
    --primary-input-radius: 8px;
    --primary-button-radius: 8px;
}
html {
    font-size: 62.5%;
    height: 100%;
}
*, *:before, *:after {
    box-sizing: border-box;
}
body {
    margin: 0;
    padding: 0;
    font-size: var(--primary-size);
    -webkit-text-size-adjust:100%;
    font-family: var(--primary-font);
    background-color: hsl( var(--primary-bg-color) );
    height: 100%;
    overflow: hidden;
}
h1 {
    font-size: var(--size28);
}
h2 {
    font-size: var(--size20);
}
.wrap {
    display: grid;
}
.content {}
.text, .icon {
    display: flex;
}
.text i-button {
    margin-right: 10px;
}
.icon i-button {
    margin-right: 10px;
}
[data-state="view"] {
    height: 100%;
}
[data-state="view"] i-log {
    display: none;
}
[data-state="debug"] {
    grid-template-rows: auto;
    grid-template-columns: 62% auto;
    height: 100%;
}
[data-state="debug"] i-log {
    position: fixed;
    top: 0;
    right: 0;
    width: 40%;
    height: 100%;
}
.container {
    display: grid;
    grid-template-rows: min-content;
    grid-template-columns: 90%;
    justify-content: center;
    align-items: start;
    background-color: var(--color-white);
    height: 100%;
    overflow: hidden auto;
}
.result {
    font-size: var(--size16);
}
.select {
    font-weight: bold;
    color: hsl(var(--color-blue));
}

.selects-result {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, auto));
    gap: 10px;
}
.badge {
    font-size: var(--size12);
    padding: 8px;
    background-color: hsl(var(--color-greyF2));
    text-align: center;
}
.total {
    display: block;
    font-size: var(--size16);
    padding-bottom: 8px;
}
.count {
    font-weight: 600;
    color: hsl(var(--color-blue));
}
@media (max-width: 768px) {
    [data-state="debug"] {
        grid-template-rows: 65% 35%;
        grid-template-columns: auto;
    }
    [data-state="debug"] i-log {
        position: inherit;
        width: 100%;
    }
    .container {
        grid-template-rows: 80px auto;
    }
}
`

document.body.append(demo())