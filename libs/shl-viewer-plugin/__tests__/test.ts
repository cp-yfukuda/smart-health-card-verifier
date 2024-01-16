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
    expect(res.shl ).toBe( shlLink );
    expect(res.payload ).toBe( 'testmehere' );

});
  

test('Picks up base64 metadata', async () => {
    const b64SHLData = "eyJ1cmwiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vc2Vhbm5vL3NoYy1kZW1vLWRhdGEvbWFpbi9jYXJkcy9jaWduYS1kZXNpZ24vandzLnR4dCIsImZsYWciOiJMVSIsImtleSI6InJ4VGdZbE9hS0pQRnRjRWQwcWNjZU44d0VVNHA5NFNxQXdJV1FlNnVYN1EiLCJsYWJlbCI6IkRlbW8gU0hMIGZvciBjaWduYS1kZXNpZ24ifQ"
    const loader = v.shlLoader
    const res = loader.decodePayload(b64SHLData)
    console.info( res )
    expect(res ).not.toBe( null );
});

test('check expiration', async () => {
    const data = {
        url: null,
        key: null,
        exp: null,
        v: null,
        label: null,
        flag: null

    } 
    const loader = v.shlLoader
    loader.shlData = data; 
    let res = loader.isExpired()
    console.info( res )
    expect( res ).toBe(false);
    loader.shlData.exp = ( new Date() ).getTime() + 1 * 24 * 60 * 60 * 1000
    res = loader.isExpired()
    expect( res ).toBe(false);
    loader.shlData.exp = 0;
    res = loader.isExpired()
    expect( res ).toBe(true);

});
