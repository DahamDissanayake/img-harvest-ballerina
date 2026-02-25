package backend.image_service.libs;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * ImgHarvest ZipCreator — Builder Pattern
 *
 * Used by Ballerina via Java Interop. All parameters use standard Java types
 * (String only — byte data is Base64-encoded). No Ballerina runtime imports
 * needed, so this compiles with plain javac against the JDK alone.
 *
 * Protocol:
 *   1. Construct with new ZipCreator()
 *   2. Call addEntry(name, base64Content) for each file
 *   3. Call finish() → returns Base64-encoded ZIP bytes
 */
public class ZipCreator {

    private final ByteArrayOutputStream baos;
    private final ZipOutputStream zos;

    public ZipCreator() {
        baos = new ByteArrayOutputStream();
        zos = new ZipOutputStream(baos);
    }

    /**
     * Add one file entry. Content is received as a Base64-encoded string
     * to avoid Ballerina byte[]↔Java byte[] interop issues.
     */
    public void addEntry(String name, String base64Content) throws IOException {
        byte[] content = Base64.getDecoder().decode(base64Content);
        zos.putNextEntry(new ZipEntry(name));
        zos.write(content);
        zos.closeEntry();
    }

    /**
     * Finish the ZIP and return the archive as a Base64-encoded string,
     * which Ballerina will decode back to byte[].
     */
    public String finish() throws IOException {
        zos.close();
        return Base64.getEncoder().encodeToString(baos.toByteArray());
    }
}
