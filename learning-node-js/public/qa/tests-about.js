/**
 * Created by Alex on 2/9/16.
 */
suite('"About" Page Tests', function(){
    test('page should contain link to contract page', function(){
        assert($('a[href="/contact"]').length);
    });
});