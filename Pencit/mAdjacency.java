import java.util.Arrays;
import java.util.Scanner;

public class mAdjacency{
 
    static Scanner scan = new Scanner(System.in);

    public static void main(String[] args) {
        int[][] px = {
            {0,1,1},
            {0,1,0},
            {0,0,1}
        };

        int[][] adjPx = new int[2][2];
        // for (int i = 0; i < 2; i++) {
        //     //Input selalu benar
        //     System.out.print("Pixel " + (i+1) + ":\n- x: ");
        //     adjPx[i][0] = scan.nextInt(); //2
        //     System.out.print("\n- y: ");
        //     adjPx[i][1] = scan.nextInt();
        // }

        adjPx[0][0] = 2;
        adjPx[0][1] = 2;
        adjPx[1][0] = 1;
        adjPx[1][1] = 3;

        //Pixel input yang pertama jadi pixel pusat
        int p = 0, q = 0;
        p = px[adjPx[0][0]-1][adjPx[0][1]-1]; //(2,1) => (1,0)
        q = px[adjPx[1][0]-1][adjPx[1][1]-1]; //(1,1) => (0,0)

        boolean found = Arrays.asList(p).contains(q);
        if (q == px[adjPx[0][0]-2][adjPx[0][1]-1] || q == px[adjPx[0][0]][adjPx[0][1]-1] || q == px[adjPx[0][0]-1][adjPx[0][1]] || q == px[adjPx[0][0]-1][adjPx[0][1]-2]){
            System.out.println("Benar 1");
        }else if((q == px[adjPx[0][0]-2][adjPx[0][1]-2] || q == px[adjPx[0][0]-2][adjPx[0][1]] || q == px[adjPx[0][0]][adjPx[0][1]-2] || q == px[adjPx[0][0]][adjPx[0][1]]) && found == false){
            System.out.println("Benar 2");
        }else{
            System.out.println("Salah");
        }
    }
}