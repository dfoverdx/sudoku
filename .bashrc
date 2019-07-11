rmjs ()
{
    find "${1:-src}" -name '*.js' -o -name '*.js.map' -o -name '*.js.snap' | xargs rm -v
}