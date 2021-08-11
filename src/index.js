const bel = require('bel')
const style_sheet = require('support-style-sheet')
const button = require('datdot-ui-button')
const message_maker = require('message-maker')
module.exports = i_list

function i_list ({page = 'Demo', flow = 'ui-list', name, body = [{text: 'no items'}], mode = 'multiple-select', expanded = false, hidden = true, theme }, protocol) {
    const recipients = []
    const make = message_maker(`${name} / ${flow} / i_list`)
    const message = make({type: 'ready'})

    function widget () {
        const send = protocol( get )
        send(message)
        const list = document.createElement('i-list')
        const shadow = list.attachShadow({mode: 'open'})
        list.setAttribute('role', 'listbox')
        list.ariaHidden = hidden
        list.ariaLabel = name
        list.tabIndex = -1
        list.ariaExpanded = expanded
        list.dataset.mode = mode
        style_sheet(shadow, style)
        try {
            body.map( (option, i) => {
                let {text, icon, current = false, selected = false} = option
                const is_current = mode === 'single-select' ? current : false
                
                let item = button({
                    page, 
                    name: text, 
                    body: text,
                    icon, 
                    role: 'option',
                    mode, 
                    current: is_current, 
                    selected,
                    theme: { 
                        props: {
                            color_hover: 'var(--color)', 
                            bg_color: 'transparent', 
                            bg_color_hover: 'transparent'}
                    }}, button_protocol(text))
                const li = (text === 'no items') 
                ? bel`<li role="listitem" data-option=${text}">${text}</li>`
                : bel`<li role="option" data-option=${text}" aria-selected=${selected}>${item}</li>`
                const option_list = text.toLowerCase().split(' ').join('-')
                shadow.append(li)
                const make = message_maker(`${option_list} / option / ${flow} / widget`)
                send( make({type: 'ready'}) )
            })
            if (body.length === 0) send({type: 'error', data: 'body no items'})
        } catch(e) {
            send({type: 'error', data: 'something went wrong'})
        }
        
        return list

        function handle_expanded_event (data) {
            list.ariaHidden = data
            list.ariaExpanded = !data
        }
        function handle_select_event (from, data) {
            const selected = !data
            const type = selected ? 'selected' : 'unselected'
            const { childNodes } = shadow
            const lists = childNodes.length < 4 ? childNodes : [...childNodes].filter( (child, index) => index !== 0)
            if (mode === 'multiple-select') {
                const make = message_maker(`${from} / option / ${flow}`)
                const arr = []
                lists.forEach( child => {
                    child.dataset.option === from ? child.setAttribute('aria-selected', selected) : false
                    if (child.getAttribute('aria-selected') === 'true') arr[arr.length] = child.dataset.option
                })
                recipients[from]( make({type, data: selected}) )
                send( make({to: name, type, data: {current_selected: arr, length: arr.length}}))
            }
            if (mode === 'single-select') {
                lists.forEach( child => {
                    const state = from === child.dataset.option ? !data : data
                    const current = state ? from : child.dataset.option
                    const make = message_maker(`${current} / option / ${flow}`)
                    const type = state ? 'selected' : 'unselected'
                    recipients[current]( make({type, data: state}) )
                    send(make({to: name, type, data: {option: current, selected: state, current: state} }))
                    list.setAttribute('aria-activedescendant', from)
                })
            }
        }
        function button_protocol (name) {
            return (send) => {
                recipients[name] = send
                return get
            }
        }
        function get (msg) {
            const {head, refs, type, data} = msg
            const to = head[1]
            const id = head[2]
            const role = head[0].split(' / ')[1]
            const from = head[0].split(' / ')[0]
            if (type === 'click') return handle_select_event(from, data)
            if (type.match(/expanded|unexpanded/)) return handle_expanded_event(data)
        }
    }

    // insert CSS style
    const custom_style = theme ? theme.style : ''
    // set CSS variables
    if (theme && theme.props) {
    var {size, size_hover, current_size,
        weight, weight_hover, current_weight,
        color, color_hover, current_color, current_bg_color, 
        bg_color, bg_color_hover, border_color_hover,
        border_width, border_style, border_opacity, border_color, border_radius, 
        padding, width, height, opacity,
        fill, fill_hover, icon_size, current_fill,
        shadow_color, offset_x, offset_y, blur, shadow_opacity,
        shadow_color_hover, offset_x_hover, offset_y_hover, blur_hover, shadow_opacity_hover
    } = theme.props
    }

    const style = `
    :host(i-list) {
        --color: ${color ? color : 'var(--primary-color)'};
        --bg-color: ${bg_color ? bg_color : 'var(--color-white)'};
        display: grid;
        margin-top: 5px;
    }
    :host(i-list[aria-hidden="true"]) {
        opacity: 0;
        animation: close 0.3s;
        pointer-events: none;
    }
    :host([aria-hidden="false"]) {
        display: grid;
        animation: open 0.3s;
    }
    li {
        display: grid;
        border: 1px solid hsl(var(--primary-color));
        margin-top: -1px;
        color: hsl(var(--color));
        background-color: hsl(var(--bg-color));
        transition: color 0.3s, background-color 0.3s ease-in-out;
        cursor: pointer;
    }
    li:hover {
        --bg-color: ${bg_color_hover ? bg_color_hover : 'var(--color-greyEB)'};
    }
    [role="listitem"] {
        --color: var(--color-grey88);
        display: grid;
        grid-template-rows: 24px;
        font-size: var(--size14);
        padding: 11px;
        align-items: center;
        broder: 1px solid hsl(var(--color-black));
    }
    [role="listitem"]:hover {
        --bg-color: var(--color-white);
        cursor: default;
    }
    @keyframes close {
        0% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }
    @keyframes open {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
    ${custom_style}
    `

    return widget()
}