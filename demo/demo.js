const head = require('head')()
const bel = require('bel')
const csjs = require('csjs-inject')
const message_maker = require('message-maker')
const make_grid = require('../src/node_modules/make-grid')

// datdot-ui dependences
const list = require('..')
const terminal = require('datdot-terminal')
const button = require('datdot-ui-button')

var id = 0

function demo () {
// ------------------------------------
    const myaddress = `${__filename}-${id++}`
    const inbox = {}
    const outbox = {}
    const recipients = {}
    const names = {}
    const message_id = to => (outbox[to] = 1 + (outbox[to]||0))

    function make_protocol (name) {
        return function protocol (address, notify) {
            names[address] = recipients[name] = { name, address, notify, make: message_maker(myaddress) }
            return { notify: listen, address: myaddress }
        }
    }
    function listen (msg) {
        console.log('New message', { msg })
        const { head, refs, type, data, meta } = msg // receive msg
        inbox[head.join('/')] = msg                  // store msg
        const [from] = head
        // send back ack
        const { notify: from_notify, make: from_make, address: from_address } = names[from]
        from_notify(from_make({ to: from_address, type: 'ack', refs: { 'cause': head } }))
        // handle
        const { notify: logs_notify, make: logs_make, address: logs_address } = recipients['logs']
        logs_notify(logs_make({ to: logs_address, type, data }))
        if (type === 'click') return click_event (from, data)
        if (type.match(/selected/)) return change_event(data)
    }
// ------------------------------------
    const logs = terminal({mode: 'compact'}, make_protocol('logs'))
    
    const option0 = [
        { list_name: 'robot', text: 'robot', icons: { icon: {name: 'star'} }, current: true },
        { list_name: 'marine', text: 'marine', icons: { icon: { name: 'edit' } },  disabled: true, },
        { list_name: 'server', text: 'server', icons: { icon: { name: 'plus' } } },
    ]
    const option1 = [
        { list_name: 'robot', text: 'Robot', icons: { icon: {name: 'star'} }, theme: { props: { option_avatar_width: '50%' } } },
        { list_name: 'marine', text: 'Marine', icons: { icon: {name: 'edit'} }, list: {name: 'plus'}, current: true, selected: true, theme: { props: { option_avatar_width: '50%' } } },
        { list_name: 'server', text: 'Server', icons: { icon: {name: 'plus'}, list: {name: 'minus'},  },
            theme: {
                props: {
                    // icon_size: '75px',
                    // list_selected_icon_size: '50px',
                    current_list_selected_icon_size: '30px',
                    current_list_selected_icon_fill: 'var(--color-blue)',
                    avatar_width: '2000px',
                    current_icon_size: '30px',
                    current_icon_fill: 'var(--color-light-green)',
                    current_size: '50px',
                    current_color: 'var(--color-light-green)',
                    current_weight: 'var(--weight800)'
                }
            }
        }
    ]
    const option2 = [
        { list_name: 'landscape1', text: `Landscape1`, icons: { icon: {name: 'star'}, list: {name: 'plus'} }, selected: true,
            cover: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg',
            theme: {
                props: {
                    // inside icon
                    // icon_size: '36px',
                    // icon_size_hover: '16px',
                    icon_fill: 'var(--color-chrome-yellow)',
                    icon_fill_hover: 'var(--color-light-green)',
                    // list icon
                    selected_icon_fill: 'var(--color-flame)',
                    selected_icon_fill_hover: 'var(--color-yellow)',
                    size: 'var(--size16)',
                    size_hover: 'var(--size30)',
                    avatar_width: '120px',
                    avatar_height: '100px'
                }
            }
        },
        { list_name: 'landscape2', text: 'Landscape2', icons: { icon: {name: 'edit'} },
            cover: 'https://cdn.pixabay.com/photo/2016/02/27/06/43/cherry-blossom-tree-1225186_960_720.jpg',            
            theme: {
                props: {
                    avatar_width: '120px', avatar_height: '100px', size: 'var(--size16)', size_hover: 'var(--size30)',
                }
            }
        },
        { list_name: 'landscape3', text: 'Landscape3', icons: { icon: {name: 'activity'}, list: {name: 'plus'} }, selected: false,
            cover: 'https://cdn.pixabay.com/photo/2015/06/19/20/13/sunset-815270__340.jpg',
            theme: { props: { avatar_width: '120px', avatar_height: '100px', size: 'var(--size16)', size_hover: 'var(--size30)' } }
        }
    ]
    const option3 = [
        { list_name: 'datdot1', text: 'DatDot1', role: 'link', url: 'https://datdot.org/', target: '_blank', icons: { icon: {name: 'star'}, list: {name: 'plus'} },
            cover: 'https://raw.githubusercontent.com/playproject-io/datdot/master/packages/datdot/logo-datdot.png',
            theme: { props: { avatar_width: '24px', avatar_radius: '50%' } }
        },
        { list_name: 'text', text: 'Twitter',  role: 'link', url: 'https://twitter.com/', icons: { icon: { name: 'transfer', path: 'https://datdotorg.github.io/datdot-ui-icon/svg'} },
            target: '_new',
            theme: {  props: { color: 'var(--color-blue)', icon_fill: 'var(--color-blue)' } }
        },
        { list_name: 'github', text: 'GitHub', role: 'link', url: 'https://github.com/', icons: { icon: {name: 'star'} }, target: '_new',
            cover: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            theme: { props: { avatar_width: '26px', avatar_radius: '50%' } }
        },
        { list_name: 'datdot-app', text: 'DatDot app', role: 'menuitem', icons: { icon: {name: 'datdot-black'} }, 
            theme: {
                props: {
                    color: 'var(--color-purple)',
                    icon_fill: 'var(--color-purple)'
                }
            }
        }
    ]

    // required module instances
    
    const terminal_list = list({ name: 'terminal-select-list', mode: 'listbox-single', hidden: false,
        body: [ { list_name: 'compact', text: 'Compact messages', }, { list_name: 'comfortable', text: 'Comfortable messages', current: true }],
        theme: {
            grid: {
                button: {
                    auto: {
                        auto_flow: 'column'
                    },
                    justify: 'content-left',
                    gap: '5px'
                }
            }
        }
    }, make_protocol('terminal-select-list'))

    const listbox_single = list({ name: 'listbox-single', body: option0, mode: 'listbox-single', hidden: false,
        theme: {
            grid: {
                list: {
                },
                button: {
                    areas: 'option icon',
                    // first step for responsive
                    columns: 'minmax(0, 100%) 1fr',
                    // 50% 50%
                    // columns: 'minmax(0, 1fr) 1fr',
                    align: 'items-center'
                },
                option: {
                    // rows: 'repeat(auto-fill, minmax(100px, 1fr))',
                    // responsive for large image
                    // second step for responsive
                    columns: 'repeat(auto-fill, minmax(0, auto))',
                    area: 'option',
                    // areas: ['option-text option-icon', 'option-avatar option-avatar'],
                    justify: 'content-left',
                    align: 'items-center',
                },
                icon: {
                    area: 'icon',
                    justify: 'self-right'
                },
                option_icon: {
                    // area: 'option-icon',
                    row: '2',
                    column: 'col-3'
                },
                option_text: {
                    // area: 'option-text',
                    row: '2',
                    column: '1 / span 2',
                    justify: 'self-center'
                },
                option_avatar: {
                    // area: 'option-avatar',
                    row: '1',
                    column: 'span 2',
                    justify: 'self-center'
                }
            }
        }
    }, make_protocol('listbox-single'))

    const listbox_multi = list({ name: 'listbox-multi', body: option2, hidden: false, 
        theme: {
            grid: {
                button: {
                    // rows: 'repeat(auto-fill, minmax(100px, 1fr))',
                    // columns: 'auto repeat(auto-fill, minmax(0, 100%))',
                    auto: {
                        auto_flow: 'column'
                    },
                    align: 'items-center',
                    justify: 'content-left',
                    gap: '20px'
                },
                option: {
                    // content auto stretch
                    columns: 'repeat(auto-fill, minmax(0, 100%))',
                    // columns: 'repeat(auto-fill, 1fr)',
                    auto: {
                        auto_flow: 'column'
                    },
                    align: 'items-center',
                    justify: 'content-center',
                    gap: '20px'
                },
                icon: {
                },
                option_icon: {
                    column: '3'
                },
                option_text: {
                    column: '2'
                }
            }
        }
    }, make_protocol('listbox-multi'))

    const menubar = list({ name: 'menubar', body: option3, mode: 'menubar', hidden: false, 
        theme: {
            grid: {
                link: {
                    justify: 'content-left',
                    align: 'items-center',
                    auto: {
                        auto_flow: 'column'
                    },
                    gap: '5px'
                },
                button: {
                    auto: {
                        auto_flow: 'column'
                    },
                    gap: '5px',
                    justify: 'content-left'
                },
                // icon: {
                //     column: '1'
                // },
                // text: {
                //     column: '3'
                // },
                // avatar: {
                //     column: '2'
                // }
            }
        }
    }, make_protocol('dropdown-list'))

    const expanded = button({ name: 'switch', body: 'Expanded', theme: { props: { width: '120px', } } }, make_protocol('switch'))

    // elements
    const option1_current = option1.filter( option => option.selected).map(({ text }) => text).join('')
    const current_multiple_selected = option2.filter( option => option.selected)
    const selected_length = bel`<span class="${css.count}">${current_multiple_selected.length}</span>`
    let select_items = bel`<span>${selected_length} ${current_multiple_selected.length > 1 ? `items` : `item`}</span>`
    const total_selected = bel`<span class="${css.total}">Total selected:</span>`
    total_selected.append(select_items)
    const select = bel`<span class="${css.select}">${option1_current}</span>`
    const select_result = bel`<div class="${css.result}">Current selected ${select}</div>`
    let selects = current_multiple_selected.map( option => bel`<span class=${css.badge}>${option.text}</span>`)
    let selects_result = bel`<div class="${css['selects-result']}"></div>`
    selects.map( select => selects_result.append(select))
    const content = bel`
    <div class="${css.content}">
        <section>
            <h1>Single select</h1>
            ${select_result}
            ${listbox_single}
        </section>
        <section>
            <h1>Terminal messages selector</h1>
            ${expanded}
            ${terminal_list}
        </section>
        <section>
            <h1>Multple select</h1>
            <div>
                ${total_selected}
                ${selects_result}
            </div>
            ${listbox_multi}
        </section>
        
        <section>
            <h1>Dropdown</h1>
            ${menubar}
        </section>
    </div>`
    const container = bel`<div class="${css.container}">${content}</div>`
    const app = bel`<div class="${css.wrap}">${container}${logs}</div>`

    return app

    function terminal_change_event (selected) {
        const mode = selected.split(' ')[0]
        recipients['logs'](make({type: 'layout-mode', data: {mode}}))
    }

    function change_event (data) {
        const { mode, selected } = data
        if (mode === 'listbox-single') {
            selected.forEach( item => {
                if (item.current && item.text.match(/Compact|Comfortable/)) return terminal_change_event(item.text.toLowerCase())
                if (item.current) return select.textContent = item.text 
            })
        }
        if (mode === 'listbox-multi') {
            const items = selected.filter( item => item.selected)
            const total = items.length
            const selected_length = bel`<span class="${css.count}">${total}</span>`
            select_items = bel`<span>${selected_length} ${selected.length > 1 ? `items` : `item`}</span>`
            selects = items.map( item => bel`<span class=${css.badge}>${item.text}</span>`)
            selects_result.innerHTML = ''
            selects.map( element => selects_result.append(element))
            total_selected.lastChild.remove()
            total_selected.append(select_items)
        }
    }
    function switch_event (from, data) {
        const state = !data
        // notify button
        const { address: from_address, notify: from_notify, make: from_make } = names[from]
        from_notify(from_make({ to: from_address, type: 'switched', data: state}))
        // notify dropdown list
        const { address, notify, make } = recipients['dropdown-list']
        notify(make({ to: address, type: 'expanded', data }))
        // notify logs
        const { address: logs_address, notify: logs_notify, make: logs_make } = recipients['logs']
        logs_notify(logs_make({to: logs_address, type: 'triggered', data: {checked: state}}) )
        // logs_notify(logs_make({to: logs_address, type: 'layout-mode', data: {expanded: state}}))
    }
    function click_event (from, data) {
        const name = names[from].name
        const { address: logs_address, notify: logs_notify, make: logs_make } = recipients['logs']
        if (name === 'switch') return switch_event(from, data)
        if (name === 'menuitem') return logs_notify(logs_make({to: logs_address, type: 'triggered', data: {app: 'datdot', install: true}}))
    }
}

const css = csjs`
:root {
    /* define colors ---------------------------------------------*/
    --b: 0, 0%;
    --r: 100%, 50%;
    --color-white: var(--b), 100%;
    --color-black: var(--b), 0%;
    --color-dark: 223, 13%, 20%;
    --color-deep-black: 222, 18%, 11%;
    --color-red: 358, 99%, 53%;
    --color-amaranth-pink: 329, 100%, 65%;
    --color-persian-rose: 323, 100%, 50%;
    --color-orange: 32, var(--r);
    --color-light-orange: 36, 100%, 55%;
    --color-safety-orange: 27, 100%, 50%;
    --color-deep-saffron: 31, 100%, 56%;
    --color-ultra-red: 348, 96%, 71%;
    --color-flame: 15, 80%, 50%;
    --color-verdigris: 180, 54%, 43%;
    --color-viridian-green: 180, 100%, 63%;
    --color-blue: 214, 100%, 49%;
    --color-heavy-blue: 233, var(--r);
    --color-maya-blue: 205, 96%, 72%;
    --color-slate-blue: 248, 56%, 59%;
    --color-blue-jeans: 204, 96%, 61%;
    --color-dodger-blue: 213, 90%, 59%;
    --color-light-green: 97, 86%, 77%;
    --color-lime-green: 127, 100%, 40%;
    --color-slimy-green: 108, 100%, 28%;
    --color-maximum-blue-green: 180, 54%, 51%;
    --color-deep-green: 136, 79%, 22%;
    --color-green: 136, 82%, 38%;
    --color-lincoln-green: 97, 100%, 18%;
    --color-yellow: 44, 100%, 55%;
    --color-chrome-yellow: 39, var(--r);
    --color-bright-yellow-crayola: 35, 100%, 58%;
    --color-green-yellow-crayola: 51, 100%, 83%;
    --color-purple: 283, var(--r);
    --color-heliotrope: 288, 100%, 73%;
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
    /* define font ---------------------------------------------*/
    --snippet-font: Segoe UI Mono, Monospace, Cascadia Mono, Courier New, ui-monospace, Liberation Mono, Menlo, Monaco, Consolas;
    --size12: 1.2rem;
    --size13: 1.3rem;
    --size14: 1.4rem;
    --size15: 1.5rem;
    --size16: 1.6rem;
    --size18: 1.8rem;
    --size20: 2rem;
    --size22: 2.2rem;
    --size24: 2.4rem;
    --size26: 2.6rem;
    --size28: 2.8rem;
    --size30: 3rem;
    --size32: 3.2rem;
    --size34: 3.4rem;
    --size36: 3.6rem;
    --size38: 3.8rem;
    --size40: 4rem;
    --size42: 4.2rem;
    --size44: 4.4rem;
    --size46: 4.6rem;
    --size48: 4.8rem;
    --size50: 5rem;
    --size52: 5.2rem;
    --size54: 5.4rem;
    --size56: 5.6rem;
    --size58: 5.8rem;
    --size60: 6rem;
    --weight100: 100;
    --weight300: 300;
    --weight400: 400;
    --weight600: 600;
    --weight800: 800;
    /* define primary ---------------------------------------------*/
    --primary-body-bg-color: var(--color-greyF2);
    --primary-font: Arial, sens-serif;
    --primary-size: var(--size14);
    --primary-size-hover: var(--primary-size);
    --primary-weight: 300;
    --primary-weight-hover: 300;
    --primary-color: var(--color-black);
    --primary-color-hover: var(--color-white);
    --primary-color-focus: var(--color-orange);
    --primary-bg-color: var(--color-white);
    --primary-bg-color-hover: var(--color-black);
    --primary-bg-color-focus: var(--color-greyA2), 1;
    --primary-border-width: 1px;
    --primary-border-style: solid;
    --primary-border-color: var(--color-black);
    --primary-border-opacity: 1;
    --primary-radius: 8px;
    --primary-avatar-width: 100%;
    --primary-avatar-height: auto;
    --primary-avatar-radius: 0;
    --primary-disabled-size: var(--primary-size);
    --primary-disabled-color: var(--color-greyA2);
    --primary-disabled-bg-color: var(--color-greyEB);
    --primary-disabled-icon-size: var(--primary-icon-size);
    --primary-disabled-icon-fill: var(--color-greyA2);
    --primary-listbox-option-icon-size: 20px;
    --primary-listbox-option-avatar-width: 40px;
    --primary-listbox-option-avatar-height: auto;
    --primary-listbox-option-avatar-radius: var(--primary-avatar-radius);
    --primary-option-avatar-width: 30px;
    --primary-option-avatar-height: auto;
    --primary-list-avatar-width: 30px;
    --primary-list-avatar-height: auto;
    --primary-list-avatar-radius: var(--primary-avatar-radius);
    /* define icon settings ---------------------------------------------*/
    --primary-icon-size: var(--size16);
    --primary-icon-size-hover: var(--size16);
    --primary-icon-fill: var(--primary-color);
    --primary-icon-fill-hover: var(--primary-color-hover);
    /* define current ---------------------------------------------*/
    --current-size: var(--primary-size);
    --current-weight: var(--primary-weight);
    --current-color: var(--color-white);
    --current-bg-color: var(--color-black);
    --current-icon-size: var(--primary-icon-size);
    --current-icon-fill: var(--color-white);
    --current-list-selected-icon-size: var(--list-selected-icon-size);
    --current-list-selected-icon-fill: var(--color-white);
    --current-list-selected-icon-fill-hover: var(--color-white);
    --current-list-size: var(--current-size);
    --current-list-color: var(--current-color);
    --current-list-bg-color: var(--current-bg-color);
    --current-list-avatar-width: var(--primary-list-avatar-width);
    --current-list-avatar-height: var(--primary-list-avatar-height);
    /* role listbox settings ---------------------------------------------*/
    /*-- collapsed --*/
    --listbox-collapsed-bg-color: var(--primary-bg-color);
    --listbox-collapsed-bg-color-hover: var(--primary-bg-color-hover);
    --listbox-collapsed-icon-size: var(--size20);
    --listbox-collapsed-icon-size-hover: var(--size20);
    --listbox-collapsed-icon-fill: var(--primary-icon-fill);
    --listbox-collapsed-icon-fill-hover: var(--primary-icon-fill-hover);
    --listbox-collapsed-listbox-size: var(--primary-size);
    --listbox-collapsed-listbox-size-hover: var(--primary-size-hover);
    --listbox-collapsed-listbox-weight: var(--primary-weight);
    --listbox-collapsed-listbox-weight-hover: var(--primary-weight);
    --listbox-collapsed-listbox-color: var(--primary-color);
    --listbox-collapsed-listbox-color-hover: var(--primary-color-hover);
    --listbox-collapsed-listbox-avatar-width: var(--primary-listbox-option-avatar-width);
    --listbox-collapsed-listbox-avatar-height: var(--primary-listbox-option-avatar-height);
    --listbox-collapsed-listbox-icon-size: var(--primary-listbox-option-icon-size);
    --listbox-collapsed-listbox-icon-size-hover: var(--primary-listbox-option-icon-size);
    --listbox-collapsed-listbox-icon-fill: var(--color-blue);
    --listbox-collapsed-listbox-icon-fill-hover: var(--color-yellow);
    /*-- expanded ---*/
    --listbox-expanded-bg-color: var(--current-bg-color);
    --listbox-expanded-icon-size: var(--size20);
    --listbox-expanded-icon-size-hover: var(--size20);
    --listbox-expanded-icon-fill: var(--color-light-green);
    --listbox-expanded-listbox-size: var(--size20);
    --listbox-expanded-listbox-weight: var(--primary-weight);
    --listbox-expanded-listbox-color: var(--current-color);
    --listbox-expanded-listbox-avatar-width: var(--primary-listbox-option-avatar-width);
    --listbox-expanded-listbox-avatar-height: var(--primary-listbox-option-avatar-height);
    --listbox-expanded-listbox-icon-size: var(--primary-listbox-option-icon-size);
    --listbox-expanded-listbox-icon-fill: var(--color-light-green);
    /* role option settings ---------------------------------------------*/
    --list-bg-color: var(--primary-bg-color);
    --list-bg-color-hover: var(--primary-bg-color-hover);
    --list-selected-icon-size: var(--size6);
    --list-selected-icon-size-hover: var(--list-selected-icon-size);
    --list-selected-icon-fill: var(--primary-icon-fill);
    --list-selected-icon-fill-hover: var(--primary-icon-fill-hover);
    /* role link settings ---------------------------------------------*/
    --link-size: var(--size14);
    --link-size-hover: var(--primary-link-size);
    --link-color: var(--color-heavy-blue);
    --link-color-hover: var(--color-dodger-blue);
    --link-bg-color: transparent;
    --link-icon-size: var(--size30);
    --link-icon-fill: var(--primary-link-color);
    --link-icon-fill-hover: var(--primary-link-color-hover);
    --link-avatar-width: 24px;
    --link-avatar-width-hover: var(--link-avatar-width);
    --link-avatar-height: auto;
    --link-avatar-height-hover: var(--link-avatar-height);
    --link-avatar-radius: 0;
    --link-disabled-size: var(--primary-link-size);
    --link-disabled-color: var(--color-greyA2);
    --link-disabled-bg-color: transparent;
    --link-disabled-icon-fill: var(--color-greyA2);
    /* role menuitem settings ---------------------------------------------*/
    --menu-size: var(--size15);
    --menu-size-hover: var(--menu-size);
    --menu-weight: var(--primary-weight);
    --menu-weigh-hover: var(--primary-weight);
    --menu-color: var(--primary-color);
    --menu-color-hover: var(--color-grey88);
    --menu-icon-size: 20px;
    --menu-icon-size-hover: var(--menu-icon-size);
    --menu-icon-fill: var(--primary-color);
    --menu-icon-fill-hover: var(--color-grey88);
    --menu-avatar-width: 50px;
    --menu-avatar-width-hover: var(--menu-avatar-width);
    --menu-avatar-height: auto;
    --menu-avatar-height-hover: var(--menu-avatar-height);
    --menu-avatar-radius: 0;
    --menu-disabled-color: var(--primary-disabled-color);
    --menu-disabled-size: var(--menu-size);
    --menu-disabled-weight: var(--primary-weight);
}
html {
    font-size: 62.5%;
    height: 100%;
}
*, *:before, *:after {
    box-sizing: border-box;
}
body {
    -webkit-text-size-adjust: 100%;
    margin: 0;
    padding: 0;
    font-size: calc(var(--primary-size) + 2px);
    font-family: var(--primary-font);
    color: var(--primary-color);
    background-color: hsl( var(--primary-body-bg-color) );
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
    ${make_grid({rows: 'minmax(0, 1fr) 200px', areas: ["container", "terminal"]})}
    height: 100%;
}
.container {
    grid-area: container;
    overflow: hidden scroll;
    height: 100%;
}
.content {
    padding: 2% 5%;
}
section {
    display: grid;
    gap: 8px;
}
.text, .icon {
    display: flex;
}
.text i-button {
    margin-right: 10px;
}
.icon i-button {
    margin-right: 10px;
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
    max-width: 100%;
    display: grid;
    /* responsive */
    grid-template-columns: repeat(auto-fill, minmax(auto, 250px));
    gap: 10px;
}
.badge {
    display: grid;
    padding: 12px;
    font-size: var(--size12);
    color: hsl(var(--color-black));
    background-color: hsl(var(--color-greyE2));
    align-items: center;
    justify-content: center;
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
`

document.body.append(demo())