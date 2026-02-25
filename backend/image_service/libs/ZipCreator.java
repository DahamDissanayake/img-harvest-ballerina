package backend.image_service.libs;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * ImgHarvest ZipCreator — Builder Pattern (Pure Java, no Ballerina imports)
 *
 * Used by Ballerina via Java Interop with `handle` type.
 * All params/returns use standard Java types (String, byte[]).
 * Only depends on the JDK standard library — no external JARs needed.
 */
public class ZipCreator {

    private final ByteArrayOutputStream baos;
    private final ZipOutputStream zos;

    /** Public constructor — called from Ballerina via @java:Constructor. */
    public ZipCreator() {
        baos = new ByteArrayOutputStream();
        zos = new ZipOutputStream(baos);
    }

    /**
     * Add one file entry.
     * Ballerina passes Java String handle and Java byte[] handle directly.
     */
    public void addEntry(String name, byte[] content) throws IOException {
        ZipEntry entry = new ZipEntry(name);
        zos.putNextEntry(entry);
        zos.write(content);
        zos.closeEntry();
    }

    /**
     * Close the ZIP stream and return the complete archive bytes.
     * Ballerina receives a Java byte[] handle.
     */
    public byte[] finish() throws IOException {
        zos.close();
        return baos.toByteArray();
    }
}
