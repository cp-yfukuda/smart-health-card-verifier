import { SHCVerifier } from "~/index"
it.todo('write a test');

const v = new SHCVerifier({})
test('verifies shc header', async () => {
    var res = await v.canSupport( ["shc:/"] );
    expect(res).not.toBe( null);
  });
  
  