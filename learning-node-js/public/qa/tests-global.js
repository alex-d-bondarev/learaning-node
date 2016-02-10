/**
 * Created by Alex on 2/9/16.
 */
suite('Global Tests', function(){
    test('page has a valid title', function(){
        assert(document.title && document.title.match(/\S/) &&
                document.title.toUpperCase() !== 'TODO');
    });
});