-- Pandoc Lua filter for the print interior (book/templates/latex/interior.tex).
-- It turns the preprocessor's book structure (title-page div, colophon div, chapters)
-- into the template's book macros and makes inline content safe for a fixed text block.

local stringify = pandoc.utils.stringify

local function latex_inlines(inlines)
  return (pandoc.write(pandoc.Pandoc({ pandoc.Plain(inlines) }), 'latex'):gsub('%s+$', ''))
end

local function latex_blocks(blocks)
  return (pandoc.write(pandoc.Pandoc(blocks), 'latex'):gsub('%s+$', ''))
end

local function raw(text)
  return pandoc.RawBlock('latex', text)
end

local TT_ESCAPES = {
  ['\\'] = '\\textbackslash{}',
  ['{'] = '\\{',
  ['}'] = '\\}',
  ['$'] = '\\$',
  ['&'] = '\\&',
  ['#'] = '\\#',
  ['^'] = '\\textasciicircum{}',
  ['_'] = '\\_',
  ['~'] = '\\textasciitilde{}',
  ['%'] = '\\%',
}

-- Characters after which a long inline code span may wrap. The mono font has no
-- hyphenation, so without these a long command or path overflows the text block.
local TT_BREAK_AFTER = {
  ['/'] = true, ['.'] = true, ['-'] = true, ['_'] = true, ['='] = true, [','] = true,
  [':'] = true, [';'] = true, ['|'] = true, ['&'] = true, ['@'] = true, ['?'] = true,
}

local function breakable_tt(text)
  local out = {}
  for _, code in utf8.codes(text) do
    local ch = utf8.char(code)
    out[#out + 1] = TT_ESCAPES[ch] or ch
    if TT_BREAK_AFTER[ch] then out[#out + 1] = '\\allowbreak{}' end
  end
  return '\\texttt{' .. table.concat(out) .. '}'
end

local function escape_url(url)
  return (url:gsub('[%%#\\{}]', function(c) return '\\' .. c end))
end

local function is_external(target)
  return target:match('^%a[%w+.-]*:') ~= nil
end

local function url_text(target)
  return (target:gsub('^mailto:', ''))
end

local function url_inline(target)
  return pandoc.RawInline('latex', '\\url{' .. escape_url(url_text(target)) .. '}')
end

-- In print a link must carry its URL visibly. Internal links (#anchor) are already
-- book-internal cross references, so they keep only their text.
local function link_with_footnote(link)
  if not is_external(link.target) then return link.content end
  if stringify(link.content) == url_text(link.target) then return url_inline(link.target) end
  local result = pandoc.List(link.content)
  result:insert(pandoc.Note({ pandoc.Plain({ url_inline(link.target) }) }))
  return result
end

-- Footnotes and headings cannot hold footnotes, so links there show the URL inline.
local function link_inline_url(link)
  if not is_external(link.target) then return link.content end
  if stringify(link.content) == url_text(link.target) then return url_inline(link.target) end
  local result = pandoc.List(link.content)
  result:extend({ pandoc.Space(), pandoc.Str('('), url_inline(link.target), pandoc.Str(')') })
  return result
end

local inline_filter = {
  Code = function(code) return pandoc.RawInline('latex', breakable_tt(code.text)) end,
}

local function code_block(block)
  return raw('\\begin{aixpcode}\n' .. block.text .. '\n\\end{aixpcode}')
end

local function sole_image(block)
  if block.t ~= 'Para' and block.t ~= 'Plain' then return nil end
  if #block.content ~= 1 or block.content[1].t ~= 'Image' then return nil end
  return block.content[1]
end

-- Splits "Chapter 3 - The Terminal Loop: ..." into a short label and the title proper.
local function split_label(inlines)
  for i = 2, #inlines - 2 do
    local a, b, c = inlines[i - 1], inlines[i], inlines[i + 1]
    if a.t == 'Space' and b.t == 'Str' and b.text == '-' and c.t == 'Space' then
      local label = pandoc.List({ table.unpack(inlines, 1, i - 2) })
      local words = 0
      for _, el in ipairs(label) do
        if el.t == 'Str' then words = words + 1 elseif el.t ~= 'Space' then return nil end
      end
      if words >= 1 and words <= 3 then
        return label, pandoc.List({ table.unpack(inlines, i + 2) })
      end
      return nil
    end
  end
  return nil
end

-- Running heads use the part of the title before its first colon.
local function short_title(inlines)
  local out = pandoc.List()
  for _, el in ipairs(inlines) do
    if el.t == 'Str' and el.text:sub(-1) == ':' then
      out:insert(pandoc.Str(el.text:sub(1, -2)))
      return out
    end
    out:insert(el)
  end
  return out
end

local function chapter(header)
  local label, title = split_label(header.content)
  if not label then title = header.content end
  local number = ''
  if label then
    local n = stringify(label):match('^Chapter%s+(%d+)$')
    if n then number = n end
  end
  local listed = header.classes:includes('unlisted') and '0' or '1'
  local block = raw(string.format('\\aixpchapter{%s}{%s}{%s}{%s}{%s}{%s}',
    label and latex_inlines(label) or '', number, latex_inlines(title),
    latex_inlines(short_title(title)), header.identifier, listed))
  return block, number ~= ''
end

local function heading_and_rest(div)
  local heading, rest = nil, pandoc.List()
  for _, block in ipairs(div.content) do
    if not heading and block.t == 'Header' then heading = block else rest:insert(block) end
  end
  return heading, rest
end

local function title_page(div)
  local heading, rest = heading_and_rest(div)
  local paras = pandoc.List()
  for _, block in ipairs(rest) do
    if block.t == 'Para' or block.t == 'Plain' then paras:insert(block.content) end
  end
  local subtitle, publisher, middle = '', '', pandoc.List()
  if #paras >= 1 then subtitle = latex_inlines(paras[1]) end
  if #paras >= 2 then publisher = latex_inlines(paras[#paras]) end
  for i = 2, #paras - 1 do middle:insert(latex_inlines(paras[i])) end
  return raw(string.format('\\aixptitlepage{%s}{%s}{%s}{%s}',
    heading and latex_inlines(heading.content) or '', subtitle,
    table.concat(middle, '\\par '), publisher))
end

local function colophon(div)
  local heading, rest = heading_and_rest(div)
  return raw(string.format('\\aixpcolophon{%s}{%s}',
    heading and latex_inlines(heading.content) or '', latex_blocks(rest)))
end

local ALERT_LABELS = {
  NOTE = 'Note', TIP = 'Tip', IMPORTANT = 'Important', WARNING = 'Warning', CAUTION = 'Caution',
}

-- GitHub/VitePress alerts ("> [!NOTE]") reach Pandoc as plain block quotes with a
-- literal marker; print them as labelled asides instead of showing the marker.
local function alert(quote)
  local first = quote.content[1]
  if not first or (first.t ~= 'Para' and first.t ~= 'Plain') then return nil end
  local marker = first.content[1]
  local kind = marker and marker.t == 'Str' and marker.text:match('^%[!(%u+)%]$')
  local label = kind and ALERT_LABELS[kind]
  if not label then return nil end
  local rest = pandoc.List({ table.unpack(first.content, 2) })
  while rest[1] and (rest[1].t == 'Space' or rest[1].t == 'SoftBreak' or rest[1].t == 'LineBreak') do
    rest:remove(1)
  end
  local blocks = pandoc.List({ raw('\\begin{aixpalert}{' .. label .. '}') })
  if #rest > 0 then blocks:insert(pandoc.Para(rest)) end
  blocks:extend({ table.unpack(quote.content, 2) })
  blocks:insert(raw('\\end{aixpalert}'))
  return blocks
end

local function next_is_heading(blocks, i)
  local nxt = blocks[i + 1]
  return nxt == nil or nxt.t == 'Header'
end

function Pandoc(doc)
  doc = doc:walk({ BlockQuote = alert })
  doc = doc:walk({ Note = function(note) return note:walk({ Link = link_inline_url }) end })
  doc = doc:walk({ Header = function(h) return h:walk({ Link = link_inline_url }) end })
  doc = doc:walk({ Link = link_with_footnote })
  doc = doc:walk(inline_filter)
  doc = doc:walk({ CodeBlock = code_block })

  local blocks = doc.blocks
  local out = pandoc.List({ raw('\\frontmatter') })
  local in_main = false
  -- The colophon sits on the verso of the title page, so the contents wait for it.
  local contents_pending = false
  for i, block in ipairs(blocks) do
    local is_colophon = block.t == 'Div' and block.classes:includes('colophon')
    if contents_pending and not is_colophon then
      out:insert(raw('\\aixpcontents'))
      contents_pending = false
    end
    if block.t == 'Div' and block.classes:includes('title-page') then
      out:insert(title_page(block))
      contents_pending = true
    elseif is_colophon then
      out:insert(colophon(block))
      if contents_pending then
        out:insert(raw('\\aixpcontents'))
        contents_pending = false
      end
    elseif block.t == 'Header' and block.level == 1 then
      local rendered, numbered = chapter(block)
      if numbered and not in_main then
        out:insert(raw('\\mainmatter'))
        in_main = true
      end
      out:insert(rendered)
    elseif block.t == 'HorizontalRule' then
      if not next_is_heading(blocks, i) then out:insert(raw('\\aixpbreak')) end
    elseif sole_image(block) then
      out:insert(raw('\\aixpimage{' .. sole_image(block).src .. '}'))
    else
      out:insert(block)
    end
  end
  if contents_pending then out:insert(raw('\\aixpcontents')) end
  doc.blocks = out
  return doc
end
