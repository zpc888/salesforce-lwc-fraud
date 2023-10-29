@RestResource(urlMapping='/doc/v1/view/*')
global with sharing class DocViewer {
    public DocViewer() {
    }

    @HttpGet
    global static void viewDocument() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        String uri = req.requestURI;
        String docId = uri.substring(uri.lastIndexOf('/') + 1);

        String base64 = getDocContentById(docId);
        Blob decoded = EncodingUtil.base64Decode(base64);

        res.statusCode = 200;
        res.addHeader('Content-Type', 'application/pdf');
        res.addHeader('Content-Disposition', 'inline; filename="' + docId + '.pdf"');
        res.responseBody = decoded;
    }

    private static String getDocContentById(String docId) {
        // make api call to retrieve document
        String base64PDF = 'JVBERi0xLjYKJfbk/N8KMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovVmVyc2lvbiAvMS42Ci9QYWdlcyAyIDAgUgo+PgplbmRvYmoKMTEgMCBvYmoKPDwKL0xlbmd0aCA1OTgKL0ZpbHRlciAvRmxhdGVEZWNvZGUKPj4Kc3RyZWFtDQp4nI2Tz47aMBDG73mKOfSwlZZgO47tcFugrFqp3WrhBdxgSiqIV46p1Lfv2CTb8KcBcTDyeL7ffDOT8dz8rkrz+jyFsklIKoUSGZCUMppLPBnPKIemTAhIwUBQBhkBZ5JNMl0l4wUFxmG1wXD44TsqZZoxTihIKtKMcMJgtU4enqazEcHbhdOHNbyaN+v8R1j9Sj6tYvI+wHNWcDg/j3BKWrFQAn2v4J07XuC1CKVQBSIvUiq4LCJ6brSDL3Zbw3Jf+e0kYgmMMpZSTlR8M9WNWYOtIQZpp4q5Xlc7rFc3GFxYBy9+a1wr0b16BLxsDGhnwj/YBJOHnak9eKfrRpe+snWTdmRWpFyExiH58wb+2ENMra2P6VVd+Up7hNlNq9yTeYS3HZZjoKl+1uAtlLbeVG5/VGckOqMpOmtbv8R32h+cmUBXQJ6luTg6/+6q2qP3b3p//UFIx/hc+y4eRja0KUxhciHiqFhvWTJQJ7uSU5livbgVjEQUIywbUTJiKEgnGT1dEArPQ1zUyJkCiudxRacnC8IxnEVH4wXHV6GSh9W/tkaDHfAGivIjC/f8KouKa7CvxpVbXfs7IZlqDZH/GboGmWmHszzsf7RLepvDb3ByRlIh+BXW094ezu2oXCkG4eRF+IQlfobtdHgxPB3S6ued/uk6sOI+UhhOQA0O54I1s40v7X2EMJloZmgyFwSlpEAhosR9FH6DkqPuJeWDfBRK4rT7kNB80W/+8rz5XJ4L9fNjS0W/pcuLlg4rxJaJvpnzEm4p8BsKoR2XChft+Asq7o9bDQplbmRzdHJlYW0KZW5kb2JqCjEyIDAgb2JqCjw8Ci9MZW5ndGggMjU1Ci9UeXBlIC9PYmpTdG0KL04gOQovRmlsdGVyIC9GbGF0ZURlY29kZQovRmlyc3QgNTIKPj4Kc3RyZWFtDQp4nM1Ry2rDMBD8lfmBVF5ZtmMIgTo0FEqhuIEeQg6OLYIgkYpll/bvu5Kgj1sLPfSgZXd2Z3YHSWTIoSQUSGUoQEWFEpJyVJB1jSXypUQNVRKIB5TCaiV2b88a4qE7aQ9xZwaPfc5KLQ4QGzfbCYT1+vskxL0eTNe4V+yzqwzhlSQ5VnWIhzA2aubKKCVa7d089rxCJWDj7MR9D6IIpA1bRvnwLwCxg0jYSnaRspydpEyxm5QVwdEnL50a5cTjfJxiGUCCaDqvU+dWn1/0ZPpu0bjzAHFjezcYe4J4MvbaevMB/EZ1Zy7aL1p36exfSfI/jEaP//jCn0u+A79EyKINCmVuZHN0cmVhbQplbmRvYmoKMTMgMCBvYmoKPDwKL0xlbmd0aCA0NgovUm9vdCAxIDAgUgovSUQgWzwyNTc0QTM2NzNBOEQxMDcxQjlBMDEyNjJFOTA3OEQwNT4gPDI1NzRBMzY3M0E4RDEwNzFCOUEwMTI2MkU5MDc4RDA1Pl0KL1R5cGUgL1hSZWYKL1NpemUgMTQKL0luZGV4IFswIDEzXQovVyBbMSAyIDFdCi9GaWx0ZXIgL0ZsYXRlRGVjb2RlCj4+CnN0cmVhbQ0KeJwVw8kNACAMBLHZcIQHEp3RfxeUAIslA1csgvnLw4tXb949fYiN4vAARy0C8w0KZW5kc3RyZWFtCmVuZG9iagpzdGFydHhyZWYKMTExMAolJUVPRgo=';
        return base64PDF;
    }
}