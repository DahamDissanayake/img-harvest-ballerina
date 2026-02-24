package org.datasetdojo;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * DatasetDojo ImageConverter
 * Used by Ballerina via Java Interop.
 * TwelveMonkeys ImageIO auto-registers WebP support when on runtime classpath.
 */
public class ImageConverter {

    /**
     * Convert raw image bytes to a different format.
     * @param imageBytes  Input image bytes (any format ImageIO can read)
     * @param format      Target format: "png", "jpg", or "webp"
     * @return            Converted image bytes
     */
    public static byte[] convert(byte[] imageBytes, String format) throws IOException {
        InputStream in = new ByteArrayInputStream(imageBytes);
        BufferedImage image = ImageIO.read(in);

        if (image == null) {
            throw new IOException("Could not decode image — unsupported or corrupt format");
        }

        // JPEG does not support alpha channel; convert to RGB
        String writerFormat = format.equalsIgnoreCase("jpg") ? "jpeg" : format;
        if (writerFormat.equalsIgnoreCase("jpeg") && image.getType() != BufferedImage.TYPE_INT_RGB) {
            BufferedImage rgbImage = new BufferedImage(
                image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_RGB
            );
            rgbImage.createGraphics().drawImage(image, 0, 0, java.awt.Color.WHITE, null);
            image = rgbImage;
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        boolean success = ImageIO.write(image, writerFormat, out);
        if (!success) {
            throw new IOException("No ImageIO writer found for format: " + writerFormat);
        }
        return out.toByteArray();
    }

    /**
     * Helper: pass-through byte array (identity function used by Ballerina bridge).
     */
    public static byte[] toJavaBytes(byte[] arr) {
        return arr;
    }

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
