" Gvim
" Fernando Guimar√£es Ferreira's vim config file
" set the X11 font to use. See 'man xlsfonts' on unix/linux
"set guifont=-misc-fixed-medium-r-normal--14-130-75-75-c-70-iso8859-1
"set guifont=8x13bold
"set guifont=9x15bold
"set guifont=7x14bold
"set guifont=7x13bold
"

" This must be first, because it changes other options as a side effect.
set nocompatible

" Highly recommended to set tab keys to 4 spaces
set tabstop=4
set shiftwidth=4
"
" The opposite is 'set wrapscan' while searching for strings....
set nowrapscan
" Set auto indentation
set ai

" The opposite is set noignorecase
set ignorecase

"show line number
set nu

set backspace=indent,eol,start
"
" Turn off the beep sounds with visual bell
set vb

" Source in your custom filetypes as given below -
" so $HOME/vim/myfiletypes.vim
"simply press <F8> to have any close tag typed tag in html codes
nnoremap \hc :call InsertCloseTag()<CR>
imap <F8> <Space><BS><Esc>\hca

" Make command line two lines high
set ch=2

" Make shift-insert work like in Xterm
map <S-Insert> <MiddleMouse>
map! <S-Insert> <MiddleMouse>

"Make ToggleCommentify works

"map <M-c> :call ToggleCommentify()<CR>j
"imap <M-c> <ESC>:call ToggleCommentify()<CR>j 

command! -complete=file -nargs=1 Remove :echo 'Remove: '.'<f-args>'.' '.(delete(<f-args>) == 0 ? 'SUCCEEDED' : 'FAILED')



" Only do this for Vim version 5.0 and later.
if version >= 500

	" I like highlighting strings inside C comments
	let c_comment_strings=1

	" Switch on syntax highlighting.
	syntax on
	" Switch on search pattern highlighting.
	set hlsearch

	if (&term =~ "xterm") || has("gui_running")
		set list listchars=tab:ª\ ,trail:∑
	else
		set list listchars=tab:>\ ,trail:-
	endif
	" Hide the mouse pointer while typing
	set mousehide

	" Hide the ugly menu bar. F10 is always available.
	set guioptions-=m
	" Set nice colors
	" background for normal text is light grey
	" Text below the last line is darker grey
	" Cursor is green
	" Constants are not underlined but have a slightly lighter background
	" Show blank spaces
"	highlight Normal guibg=White
"	highlight Cursor guibg=Blue guifg=NONE
	highlight NonText guibg=grey80
"	highlight Constant gui=NONE guibg=grey95
"	highlight Special gui=NONE guibg=grey95
	highlight WhiteSpaceEOL ctermbg=grey guibg=grey
	match WhiteSpaceEOL /^\s*\ \s*\|\s\+$/
	autocmd WinEnter * match WhiteSpaceEOL /^\s*\ \s*\|\s\+$/ 
endif


