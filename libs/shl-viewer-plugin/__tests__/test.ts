import { SHLViewer } from "~/index"
it.todo('write a test');

const v = new SHLViewer({})
test('verifies shl', async () => {
    let res = null 
    try {
        res = await v.canSupport( ["shc:/"] );
    } catch ( e ) {
    }
    expect(res).toBe( null );
    res = null
    try {
        res = await v.canSupport( ["shlink:/"] );
    } catch ( e ) {
    
    }
    expect(res).not.toBe( null );
});
  


test('picks up shl link from url ', async () => {
    const shlLink = "shlink:/testmehere"
    res = v.shlLoader.getIPSURL(`werwersdfs#${shlLink}`)
    expect(res).toBe( shlLink );

});
  