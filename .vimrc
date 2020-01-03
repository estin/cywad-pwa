autocmd FileType javascript,json setlocal expandtab shiftwidth=2 tabstop=2 softtabstop=2
autocmd FileType javascript,json,css autocmd BufWritePre <buffer> :%s/\s\+$//e

let g:ale_fixers = {'javascript': ['eslint']}
let g:ale_linters = {'javascript': ['eslint']}
let g:ale_linters_explicit = 1
