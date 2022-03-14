const style_sheet = require('support-style-sheet')
const button = require('datdot-ui-button')
const i_link = require('datdot-ui-link')
const message_maker = require('message-maker')
const make_grid = require('make-grid')
module.exports = i_list

var id = 0
var count = 0

function i_list (opts = {}, parent_protocol) {
// -----------------------------------
    const myaddress = `${__filename}-${id++}`
    const inbox = {}
    const outbox = {}
    const recipients = {}
    const names = {}
    const message_id = to => (outbox[to] = 1 + (outbox[to]||0))

    const {notify, address} = parent_protocol(myaddress, listen)
    names[address] = recipients['parent'] = { name: 'parent', notify, address, make: message_maker(myaddress) }
    notify(recipients['parent'].make({ to: address, type: 'ready', refs: {} }))

    function make_protocol (name) {
        return function protocol (address, notify) {
            console.log('PROTOCOL INIT', { name, address })
            names[address] = recipients[name] = { name, address, notify, make: message_maker(myaddress) }
            return { notify: listen, address: myaddress }
        }
    }

    function listen (msg) {
        const { head, refs, type, data, meta } = msg // receive msg
        inbox[head.join('/')] = msg                  // store msg
        const [from] = head
        console.log('LIST', { type, from, name: names[from].name, msg, data })
        // handle
        if (type.match(/expanded|collapsed/)) return handle_expanded_event(data)
        if (type === 'click') return handle_select_event(msg)
    }
// -----------------------------------
    const {name, body = [], mode = 'listbox-multi', expanded = false, hidden = true, theme = {} } = opts
    // mode: 'compact', 'listbox-single', 'menubar', 'listbox-multi' (default)
    // expanded: true/false
    // hidden: true/false

    const { grid } = theme

    var status // 'is-expanded-hidden', 'is-collapsed-hidden', 'is-expanded-visible', 'is-collapsed-visible'

    const list = document.createElement('i-list')
    const shadow = list.attachShadow({mode: 'closed'})
    
    function widget () {
        list.ariaHidden = hidden
        list.ariaLabel = name
        list.tabIndex = -1
        list.ariaExpanded = !hidden ? !hidden : expanded
        list.dataset.mode = mode
        style_sheet(shadow, style)
        const { make } = recipients['parent']
        try {
            if (body.length === 0) return notify(make({ to: address, type: 'error', data: { text: 'body no items', opts } }))
            if (mode.match(/listbox/)) list.setAttribute('role', 'listbox') // <i-list role="listbox" data-mode="single"></i-list>  
            else if (mode.match(/menubar/)) list.setAttribute('role', 'menubar')
            make_list(body)
        } catch(e) {
            notify(make({ to: address, type: 'error', data: {text: 'something went wrong', e, opts }}))
        }
        
        return list

        function make_list (body) {
            body.forEach( (item, i) => {
                console.log('NEW LIST CREATED', { item })
                const { 
                    list_name, 
                    address = undefined, 
                    url = '#', 
                    target = '_blank', 
                    text = undefined, 
                    role = 'option', 
                    icons = {}, 
                    cover, 
                    current = false, // aria-current values = { page, step, location, date, time, true, false }
                    selected = false, 
                    disabled = false, 
                    theme = {}
                } = item
                const {style = ``, props = {}} = theme
                // const is_current = mode === 'listbox-single' ? current : false
                const is_current = current 
                const {
                    size = 'var(--primary-size)', 
                    size_hover = 'var(--primary-size)',
                    weight = '300', 
                    color = 'var(--primary-color)', 
                    color_hover = 'var(--primary-color-hover)', 
                    color_focus = 'var(--color-white)',
                    bg_color = 'var(--primary-bg-color)', 
                    bg_color_hover = 'var(--primary-bg-color-hover)', 
                    bg_color_focus = 'var(--primary-bg-color-focus)',
                    icon_size = 'var(--primary-icon-size)',
                    icon_size_hover = 'var(--primary-icon-size-hover)',
                    icon_fill = 'var(--primary-icon-fill)',
                    icon_fill_hover = 'var(--primary-icon-fill-hover)',
                    avatar_width = 'var(--primary-avatar-width)', 
                    avatar_height = 'var(--primary-avatar-height)', 
                    avatar_radius = 'var(--primary-avatar-radius)',
                    current_size = 'var(--current-list-size)',
                    current_color = 'var(--current-list-color)',
                    current_weight = 'var(--current-list-weight)',
                    current_icon_size = 'var(--current-icon-size)',
                    current_icon_fill = 'var(--current-icon-fill)',
                    current_list_selected_icon_size = 'var(--current-list-selected-icon-size)',
                    current_list_selected_icon_fill = 'var(--current-list-selected-icon-fill)',
                    list_selected_icon_size = 'var(--list-selected-icon-size)',
                    list_selected_icon_fill = 'var(--list-selected-icon-fill)',
                    list_selected_icon_fill_hover = 'var(--list-selected-icon-fill-hover)',
                    disabled_color = 'var(--primary-disabled-color)',
                    disabled_bg_color = 'var(--primary-disabled-bg-color)',
                    disabled_icon_fill = 'var(--primary-disabled-fill)',
                    padding = '',
                    opacity = '0'
                } = props

                if (role === 'link' ) {
                    console.log('It is link, let us make an element')
                    el = i_link({ name: list_name, body: text, role: 'link', link: { url, target }, icons, cover, disabled, theme: { style, props, grid } }, make_protocol(list_name))
                    console.log('Got the link, maybe..')
                }

                else if (role === 'menuitem') {
                    const button_name = `button-${count++}`
                    el = button({ name: button_name, body: text, role, icons, cover, disabled, 
                        theme: {
                            style,
                            props: {
                                size, size_hover,
                                color, color_hover,
                                bg_color, bg_color_hover,
                                icon_fill, icon_fill_hover,
                                icon_size, icon_size_hover,
                                current_icon_size,
                                avatar_width, avatar_height, avatar_radius,
                                disabled_color, disabled_bg_color, disabled_icon_fill,
                                padding
                            },
                            grid
                        }
                    }, make_protocol(button_name))
                }

                else {
                    const button_name = `button-${count++}`
                    el = button({ name: button_name, body: text, role, icons, cover, current: is_current, selected, disabled,
                        theme: {
                            style,
                            props: {
                                size, size_hover, weight, 
                                color, color_hover, color_focus,
                                bg_color, bg_color_hover, bg_color_focus,
                                icon_size, icon_size_hover, icon_fill, icon_fill_hover,
                                avatar_width, avatar_height, avatar_radius,
                                current_size, current_color, current_weight,
                                current_icon_size, current_icon_fill,
                                current_list_selected_icon_size, current_list_selected_icon_fill,
                                list_selected_icon_size, list_selected_icon_fill, list_selected_icon_fill_hover,
                                disabled_color, disabled_bg_color, disabled_icon_fill,
                                padding,
                                opacity
                            },
                            grid
                    } }, make_protocol(button_name))
                }


                const li = document.createElement('li')
                if (address) li.dataset.address = address
                li.dataset.option = text || list_name
                li.setAttribute('aria-selected', is_current || selected)
                if (is_current) li.setAttribute('aria-current', is_current)
                if (disabled) li.setAttribute('disabled', disabled)
                li.append(el)
                shadow.append(li)
                notify(make({ to: address, type: 'ready' }))
            })
        }
    }

    // ------------------------------------------------------------------
    
    function set_attr ({el, aria, prop}) {
        el.setAttribute(`aria-${aria}`, prop)
        console.log('LISTSETTING ATTR', {el, aria, prop})
    }

    function handle_expanded_event (data) {
        const is_expanded  = data
        set_attr({el: list, aria: 'hidden', prop: !is_expanded})
        set_attr({el: list, aria: 'expanded', prop: is_expanded})
    }
    function manage_selected ({ mode, from, lists, data }) {
        const name = names[from].name
        const { notify: name_notify, address: name_address, make: name_make } = recipients[name]
        const { selected } = data
        const type = selected ? 'selected' : 'unselected'
        const new_state = !selected
        lists.forEach(list => {
            // debugger
            const label = list.firstChild.getAttribute('aria-label') 
            if (label === name) {
                if (mode === 'listbox-multi') {
                    set_attr({el: list, aria: 'selected', prop: new_state})
                    name_notify(name_make({ to: name_address, type, data: { selected: new_state } }))
                }
                else if (mode === 'listbox-single') {
                    set_attr({el: list, aria: 'current', prop: new_state})
                    set_attr({el: list, aria: 'selected', prop: new_state})
                    name_notify(name_make({ to: name_address, type, data: { state: new_state } }))
                    name_notify(name_make({ to: name_address, type: 'current', data: { state: new_state }}))

                    const { make } = recipients['parent']
                    notify(make({ to: address, type: 'selected', data: { selected: from } }))
                }
            }
        })
    }
    function handle_select_event (msg) {
        const {head, type, data} = msg
        const [from] = head
        if (from === 'menuitem') return handle_click_event(type, data)
        // !important  <style> as a child into inject shadowDOM, only Safari and Firefox did, Chrome, Brave, Opera and Edge are not count <style> as a childElemenet
        const lists = shadow.firstChild.tagName !== 'STYLE' ? shadow.childNodes : [...shadow.childNodes].filter( (child, index) => index !== 0)
        if (mode.match(/listbox/)) manage_selected({ mode, from, lists, data })
    }
    function handle_click_event (type, data) {
        const { make } = recipients['parent']
        notify(make({to: address, type, data}))
    }
    
    // insert CSS style
    const custom_style = theme ? theme.style : ''
    // set CSS variables
    if (theme && theme.props) {
        var {
            bg_color, bg_color_hover,
            current_bg_color, current_bg_color_hover, disabled_bg_color,
            width, height, border_width, border_style, border_opacity, border_color,
            border_color_hover, border_radius, padding,  opacity,
            shadow_color, offset_x, offset_y, blur, shadow_opacity,
            shadow_color_hover, offset_x_hover, offset_y_hover, blur_hover, shadow_opacity_hover
        } = theme.props
    }

    const style = `
    :host(i-list) {
        ${width && 'width: var(--width);'};
        ${height && 'height: var(--height);'};
        display: grid;
        ${make_grid(grid)}
        max-width: 100%;
    }
    :host(i-list[aria-hidden="true"]) {
        opacity: 0;
        animation: close 0.3s;
        pointer-events: none;
    }
    :host([aria-hidden="false"]) {
        animation: open 0.3s;
    }
    li {
        --bg-color: ${bg_color ? bg_color : 'var(--primary-bg-color)'};
        --border-radius: ${border_radius ? border_radius : 'var(--primary-radius)'};
        --border-width: ${border_width ? border_width : 'var(--primary-border-width)'};
        --border-style: ${border_style ? border_style : 'var(--primary-border-style)'};
        --border-color: ${border_color ? border_color : 'var(--primary-border-color)'};
        --border-opacity: ${border_opacity ? border_opacity : 'var(--primary-border-opacity)'};
        --border: var(--border-width) var(--border-style) hsla(var(--border-color), var(--border-opacity));
        display: grid;
        grid-template-columns: 1fr;
        background-color: hsl(var(--bg-color));
        border: var(--border);
        margin-top: -1px;
        cursor: pointer;
        transition: background-color 0.3s ease-in-out;
    }
    li:hover {
        --bg-color: ${bg_color_hover ? bg_color_hover : 'var(--primary-bg-color-hover)'};
    }
    :host(i-list) li:nth-of-type(1) {
        border-top-left-radius: var(--border-radius);
        border-top-right-radius: var(--border-radius);
    }
    li:last-child {
        border-bottom-left-radius: var(--border-radius);
        border-bottom-right-radius: var(--border-radius);
    }
    [role="listitem"] {
        display: grid;
        grid-template-rows: 24px;
        padding: 11px;
        align-items: center;
    }
    [role="listitem"]:hover {
        cursor: default;
    }
    li[disabled="true"], li[disabled="true"]:hover {
        background-color: ${disabled_bg_color ? disabled_bg_color : 'var(--primary-disabled-bg-color)'};
        cursor: not-allowed;
    }
    [role="none"] {
        --bg-color: var(--list-bg-color);
        --opacity: 1;
        background-color: hsla(var(--bg-color), var(--opacity));
    }
    [role="none"]:hover {
        --bg-color: var(--list-bg-color-hover);
        --opacity: 1;
        background-color: hsla(var(--bg-color), var(--opacity));
    }
    [role="none"] i-link {
        padding: 12px;
    }
    [role="option"] i-button.icon-right, [role="option"] i-button.text-left {
        grid-template-columns: auto 1fr auto;
    }
    [aria-current="true"] {
        --bg-color: ${current_bg_color ? current_bg_color : 'var(--current-bg-color)'};
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