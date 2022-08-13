const toggle = require('datdot-ui-toggle')
const protocol_maker = require('protocol-maker')

var id = 0
var count = 0
const sheet = new CSSStyleSheet()
const default_opts = { 
	name: 'list',
	body: [],
	theme: get_theme()
}
sheet.replaceSync(default_opts.theme)

module.exports = list

list.help = () => { return { opts: default_opts } }

function list (opts, parent_wire) {
// -----------------------------------
	const initial_contacts = { 'parent': parent_wire }
	const contacts = protocol_maker('input-number', listen, initial_contacts)
	function listen (msg) {
		const { head, refs, type, data, meta } = msg // receive msg
		const [from] = head
		console.log('LIST LISTENING', { type, from, name: contacts.by_address[from].name, msg, data })
		// handle
		if (type === 'click') return handle_click_event(msg)
		if (type === 'help') {
			const $from = contacts.by_address[from]
			$from.notify($from.make({ to: $from.address, type: 'help', data: { state: get_current_state() }, refs: { cause: head }}))                         
		}
		if (type === 'update') handle_update(data)
	}
// -----------------------------------
	const {
		name = default_opts.name, 
		body = default_opts.body, 
		theme = `` } = opts
		
	const current_state =  { opts: { name, body, sheets: [default_opts.theme, theme] } }
	const list = document.createElement('i-list')
	const shadow = list.attachShadow({mode: 'closed'})
	
	list.ariaLabel = name
	list.tabIndex = -1
	
	body.forEach( (item, i) => {
		const li_el = make_li(item, i)
		shadow.append(li_el)
	})

	const custom_theme = new CSSStyleSheet()
	custom_theme.replaceSync(theme)
	shadow.adoptedStyleSheets = [sheet, custom_theme]

	return list

	// event handlers
	function handle_click_event (msg) {
			const {head, type, data} = msg
			const [from] = head
			const $parent = contacts.by_name['parent']
			$parent.notify($parent.make({ to: $parent.address, type: 'click', data: { name: contacts.by_address[from].name, pressed: data.pressed }}))        
	}
	function handle_update (data) {
		const { body, sheets } = data
		if (body) {
			const len = current_state.opts.body.length
			for (var i = 0; i < len; i++) {
				const new_item = body[i]
				const old_item = current_state.opts.body[i]
				if (JSON.stringify(old_item) === JSON.stringify(new_item) || Object.keys(new_item).length === 0) continue
				const new_li = make_li(new_item, i)
				shadow.querySelectorAll('li')[i].replaceWith(new_li)
			}
		}
		if (sheets) {
			const new_sheets = sheets.map(sheet => {
				if (typeof sheet === 'string') {
					current_state.opts.sheets.push(sheet)
					const new_sheet = new CSSStyleSheet()
					new_sheet.replaceSync(sheet)
					return new_sheet
					} 
					if (typeof sheet === 'number') return shadow.adoptedStyleSheets[sheet]
			})
			shadow.adoptedStyleSheets = new_sheets
		}
	}

	// helpers
	function make_li (item, i) {
		const { text = undefined, icons = [], status = {}, theme = {}} = item
		status.selected = status.selected || false
		status.disabled = status.disabled || false
		const { style = ``, props = {} } = theme
		const li = document.createElement('li')
		li.setAttribute('aria-selected', status.selected)
		if (status.disabled) li.setAttribute('disabled', status.disabled)
		const toggle_name = `toggle-${count++}`
		const el = toggle({ name: toggle_name, text, icons, status, theme }, contacts.add(toggle_name))
		li.append(el)
		return li
	}
}

// helpers
function get_current_state () {
	return  {
		opts: current_state.opts,
		contacts
	}
}

function get_theme () {
	return `
	:root {
		--b: 0, 0%;
    --r: 100%, 50%;
    --color-white: var(--b), 100%;
    --color-black: var(--b), 0%;
		--width: 100%;
		--height: 100%;
		--primary-bg-color: var(--color-white);
		--primary-bg-color-hover: var(--color-black);
		--primary-radius: 8px;
		--primary-border-width: 1px;
		--primary-border-style: solid;
		--primary-border-color: var(--color-black);
		--primary-border-opacity: 1;
	}
	:host(i-list) {
		width: var(--width);
		height: var(--height);
		display: grid;
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
		--bg-color: var(--primary-bg-color);
		--border-radius: var(--primary-radius);
		--border-width: var(--primary-border-width);
		--border-style: var(--primary-border-style);
		--border-color: var(--primary-border-color);
		--border-opacity: var(--primary-border-opacity);
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
		--bg-color: var(--primary-bg-color-hover)

	}
	:host(i-list) li:nth-of-type(1) {
		border-top-left-radius: var(--border-radius);
		border-top-right-radius: var(--border-radius);
	}
	li:last-child {
		border-bottom-left-radius: var(--border-radius);
		border-bottom-right-radius: var(--border-radius);
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
	`
}