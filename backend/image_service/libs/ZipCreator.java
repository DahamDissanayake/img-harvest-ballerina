package org.imgharvest;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * ImgHarvest ZipCreator
 * Used by Ballerina via Java Interop.
 * Only depends on java.util.zip (JDK standard library — no external JARs needed).
 */
public class ZipCreator {

    /**
     * Build an in-memory ZIP from parallel arrays of filenames and byte contents.
     * @param names    Array of filenames
     * @param contents Array of file byte arrays (parallel to names)
     * @return         ZIP archive bytes
     */
    public static byte[] createZip(String[] names, byte[][] contents) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            for (int i = 0; i < names.length; i++) {
                ZipEntry entry = new ZipEntry(names[i]);
                zos.putNextEntry(entry);
                zos.write(contents[i]);
                zos.closeEntry();
            }
        }
        return baos.toByteArray();
    }
}
